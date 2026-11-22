const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const sharp = require("sharp");
// Run the real TypeScript handlers with controlled service boundaries; no live writes.
function load(file, mocks = {}, cache = new Map()) {
  const full = path.resolve(file);
  if (cache.has(full)) return cache.get(full).exports;
  const mod = { exports: {} }; cache.set(full, mod);
  const code = ts.transpileModule(fs.readFileSync(full, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const req = name => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "server-only") return {};
    if (name.startsWith("@/") || name.startsWith(".")) {
      let target = name.startsWith("@/") ? path.resolve("src", name.slice(2)) : path.resolve(path.dirname(full), name);
      if (!path.extname(target)) target += ".ts";
      return load(target, mocks, cache);
    }
    return require(name);
  };
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: full })(req, mod, mod.exports);
  return mod.exports;
}
const helper = load("src/lib/registration-helpers.ts");
test("rejects malformed identity, future DOB, unsupported kits and injected objects", () => {
  assert.equal(helper.signupSchema.safeParse({ firstName: { $ne: null } }).success, false);
  assert.equal(helper.generalSchema.safeParse({ dob: "2999-01-01T00:00:00Z" }).success, false);
  assert.equal(helper.kitSchema.safeParse({ role: "sports", tshirt: "arbitrary", waist: "L", agreement: "true", outdoor: [], indoor: [] }).success, false);
  assert.throws(() => helper.normalizePhone("123"));
  assert.equal(helper.normalizeJersey("007"), 7);
  assert.throws(() => helper.normalizeJersey("7abc"));
});
test("rejects duplicate, wrong-category and cultural sport selections", () => {
  assert.throws(() => helper.validateSports(["CRICKET", "CRICKET"], [], "MALE", "sports"));
  assert.throws(() => helper.validateSports(["FOOTBALL"], [], "FEMALE", "sports"));
  assert.throws(() => helper.validateSports([], ["CHESS"], "MALE", "cultural"));
  helper.validateSports(["CRICKET"], ["CHESS"], "MALE", "sports");
  helper.validateSports(["CRICKET", "THROWBALL", "KHO KHO"], [], "FEMALE", "sports");
  helper.validateSports([], ["CHESS", "CARROM", "BADMINTON"], "FEMALE", "sports");
});
function finish(overrides = {}) {
  const state = { uploaded: [], removed: [], fields: null };
  const record = { _id: "record1", firebaseUid: "uid1", gender: "MALE", branch: "vadodara", bloodGroup: "O+", updatedAt: new Date(0) };
  const collection = {
    findOne: async query => query.imagePaths || query.jerseyNumber !== undefined ? null : record,
    updateOne: async (filter, update) => { state.fields = update.$set; return { matchedCount: 1 }; },
    ...overrides,
  };
  const route = load("src/app/api/registration/finish/route.ts", {
    "@/lib/firebase-admin": { authenticatedUser: async () => ({ uid: "uid1" }), authError: () => Response.json({}, { status: 401 }) },
    "@/lib/mongodb": { registrations: async () => collection },
    "@/lib/supabase": {
      imageStorage: () => ({ storage: { upload: async p => { state.uploaded.push(p); return {}; }, remove: async paths => { state.removed.push(...paths); return {}; } } }),
      imageUrls: async paths => paths.map(p => `https://storage.example/${p}`),
    },
  });
  return { route, state, record };
}
async function request(image, changes = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries({ role: "sports", jerseyNumber: "7", tshirt: "L", waist: "L", agreement: "true", outdoor: '["CRICKET"]', indoor: '[]', ...changes })) form.set(key, value);
  form.append("images", new Blob([image], { type: "image/jpeg" }), "photo.jpg");
  return new Request("http://localhost/api/registration/finish", { method: "POST", body: form });
}
const jpeg = () => sharp({ create: { width: 8, height: 8, channels: 3, background: "white" } }).jpeg().toBuffer();
test("successful finish links uploaded image paths and URLs in MongoDB", async () => {
  const {route,state}=finish(); const response=await route.POST(await request(await jpeg()));
  assert.equal(response.status,200); assert.equal(state.fields.registrationStatus,"completed");
  assert.equal(state.fields.imagePaths[0],state.uploaded[0]); assert.ok(state.fields.imageUrls[0].includes(state.uploaded[0])); assert.equal(state.removed.length,0);
});
test("fake JPEG never reaches storage or database", async () => {
  const {route,state}=finish(); const response=await route.POST(await request("not an image"));
  assert.equal(response.status,400); assert.equal(state.uploaded.length,0); assert.equal(state.fields,null);
});
test("a database failure cleans up uploaded images", async () => {
  const {route,state}=finish({ updateOne: async () => { throw new Error("write failed"); } });
  const response=await route.POST(await request(await jpeg()));
  assert.equal(response.status,500); assert.deepEqual(state.removed,state.uploaded);
});
test("an ambiguous MongoDB commit retains images already referenced by the record", async () => {
  const {route,state}=finish({ findOne: async query => query.imagePaths ? { imagePaths: [] } : query.jerseyNumber !== undefined ? null : { _id: "1", branch: "vadodara", gender: "MALE", bloodGroup: "O+" }, updateOne: async () => { throw new Error("response lost after commit"); } });
  assert.equal((await route.POST(await request(await jpeg()))).status,200); assert.equal(state.removed.length,0);
});
test("completed registrations are idempotent and do not upload again", async () => {
  const {route,state,record}=finish(); record.registrationStatus="completed";
  assert.equal((await route.POST(await request(await jpeg()))).status,200); assert.equal(state.uploaded.length,0);
});
test("jersey race returns conflict and cleans up images", async () => {
  const {MongoServerError}=require("mongodb");
  const {route,state}=finish({ updateOne: async () => { throw new MongoServerError({ message: "duplicate", code:11000, keyPattern:{jerseyNumber:1} }); } });
  assert.equal((await route.POST(await request(await jpeg()))).status,409); assert.deepEqual(state.removed,state.uploaded);
});
test("unauthenticated requests fail before database access", async () => {
  const route=load("src/app/api/registration/signup/route.ts", { "@/lib/mongodb": { registrations: () => { throw new Error("must not connect"); } } });
  const response=await route.POST(new Request("http://localhost/signup",{method:"POST",body:"{}"}));
  assert.equal(response.status,401);
});

for (const existing of [null, { registrationStatus: "incomplete" }]) {
  test(`signup preserves separate name fields on ${existing ? "update" : "insert"}`, async () => {
    let saved;
    const route = load("src/app/api/registration/signup/route.ts", {
      "@/lib/firebase-admin": { authenticatedUser: async () => ({ uid: "name-test", email: "names@example.com" }), authError: () => Response.json({}, { status: 401 }) },
      "@/lib/mongodb": { registrations: async () => ({
        findOne: async () => existing,
        insertOne: async document => { saved = document; },
        updateOne: async (_, update) => { saved = update.$set; return { matchedCount: 1 }; },
      }) },
    });
    const response = await route.POST(new Request("http://localhost/signup", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: " Aarav ", middleName: " Rajeshbhai ", surname: " Mehta ", grNo: "TEST-001", mobile: "9825040142", gender: "MALE" }),
    }));
    assert.equal(response.status, existing ? 200 : 201);
    assert.equal(saved.firstName, "Aarav");
    assert.equal(saved.middleName, "Rajeshbhai");
    assert.equal(saved.surname, "Mehta");
    const { registrationProfile } = load("src/lib/registration-profile.ts", {
      "./supabase": { imageUrls: async () => [] },
    });
    const profile = await registrationProfile(saved);
    assert.equal(profile.middleName, "Rajeshbhai");
    assert.equal(profile.surname, "Mehta");
  });
}
test("finish stores sport names separately from portrait object paths", async () => {
  const { route, state } = finish();
  const response = await route.POST(await request(await jpeg(), { outdoor: '["CRICKET"]', indoor: '["CHESS"]' }));
  assert.equal(response.status, 200);
  assert.deepEqual(state.fields.outdoor, ["CRICKET"]);
  assert.deepEqual(state.fields.indoor, ["CHESS"]);
  assert.ok(state.fields.imagePaths[0].endsWith(".jpg"));
});
test("sport image filenames are rejected before uploads or database writes", async () => {
  const { route, state } = finish();
  const response = await route.POST(await request(await jpeg(), { outdoor: '["cricket.png"]' }));
  assert.equal(response.status, 400);
  assert.equal(state.uploaded.length, 0);
  assert.equal(state.fields, null);
});

test("MongoDB table columns display multiple sport names as text", async () => {
  const { route, state } = finish();
  const response = await route.POST(await request(await jpeg(), { outdoor: '["CRICKET", "VOLLEYBALL"]', indoor: '["BADMINTON"]' }));
  assert.equal(response.status, 200);
  assert.equal(state.fields.outdoorSports, "CRICKET, VOLLEYBALL");
  assert.equal(state.fields.indoorSports, "BADMINTON");
  assert.deepEqual(state.fields.outdoor, ["CRICKET", "VOLLEYBALL"]);
});
test("MongoDB table columns display None for unselected categories", async () => {
  const { route, state } = finish();
  const response = await route.POST(await request(await jpeg(), { role: "cultural", outdoor: '[]', indoor: '[]' }));
  assert.equal(response.status, 200);
  assert.equal(state.fields.outdoorSports, "None");
  assert.equal(state.fields.indoorSports, "None");
});

for (const choice of ["true", "false"]) {
  test(`sports cultural toggle ${choice} persists and reloads as a boolean`, async () => {
    const { route, state } = finish();
    const response = await route.POST(await request(await jpeg(), { alsoParticipatesInCultural: choice }));
    assert.equal(response.status, 200);
    assert.equal(state.fields.alsoParticipatesInCultural, choice === "true");
    assert.equal(state.fields.role, "sports");
    const { registrationProfile } = load("src/lib/registration-profile.ts", { "./supabase": { imageUrls: async () => [] } });
    const profile = await registrationProfile(state.fields);
    assert.equal(profile.alsoParticipatesInCultural, choice === "true");
  });
}
test("older clients default cultural toggle to false; invalid values are rejected", async () => {
  const { route, state } = finish();
  assert.equal((await route.POST(await request(await jpeg()))).status, 200);
  assert.equal(state.fields.alsoParticipatesInCultural, false);
  const invalid = finish();
  assert.equal((await invalid.route.POST(await request(await jpeg(), { alsoParticipatesInCultural: "yes-please" }))).status, 400);
  assert.equal(invalid.state.uploaded.length, 0);
});
test("cultural-only registration does not inherit the sports cultural toggle", async () => {
  const { route, state } = finish();
  assert.equal((await route.POST(await request(await jpeg(), { role: "cultural", outdoor: '[]', indoor: '[]', alsoParticipatesInCultural: "true" }))).status, 200);
  assert.equal(state.fields.alsoParticipatesInCultural, false);
});
