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

test("shared registrations folder keeps named portraits unique and MongoDB links aligned", async () => {
  const { route, state, record } = finish();
  Object.assign(record, { firstName: "Heet", middleName: "Dharmesh", surname: "Shah" });
  assert.equal((await route.POST(await request(await jpeg(), { firstName: "Untrusted" }))).status, 200);
  assert.match(state.uploaded[0], /^registrations\/heet-dharmesh-shah-[0-9a-f-]{36}\.jpg$/);
  assert.equal(state.fields.imagePaths[0], state.uploaded[0]);
  assert.equal(state.fields.imageUrls[0], `https://storage.example/${state.uploaded[0]}`);
  const other = finish();
  Object.assign(other.record, { firstName: "Heet", middleName: "Dharmesh", surname: "Shah" });
  assert.equal((await other.route.POST(await request(await jpeg()))).status, 200);
  assert.notEqual(other.state.uploaded[0], state.uploaded[0]);
});
test("portrait filenames sanitize punctuation, accents and path separators", async () => {
  const { route, state, record } = finish();
  Object.assign(record, { firstName: " José / ../ ", middleName: "", surname: "O'Neil" });
  assert.equal((await route.POST(await request(await jpeg()))).status, 200);
  assert.match(state.uploaded[0], /^registrations\/jose-o-neil-[0-9a-f-]{36}\.jpg$/);
});
test("portrait filenames have a safe fallback for names with no ASCII characters", async () => {
  const { route, state, record } = finish();
  Object.assign(record, { firstName: "!!!", middleName: "", surname: "..." });
  assert.equal((await route.POST(await request(await jpeg()))).status, 200);
  assert.match(state.uploaded[0], /^registrations\/participant-[0-9a-f-]{36}\.jpg$/);
});

for (const [route, methods] of Object.entries({ signup: ['POST'], general: ['PATCH'], finish: ['POST'], me: ['GET'], 'jersey-availability': ['GET'], admin: ['GET', 'PATCH'], support: ['GET', 'PATCH', 'DELETE'] })) {
  for (const method of methods) test(`${route} ${method} denies anonymous access before services`, async () => {
    const handler = load(`src/app/api/registration/${route}/route.ts`, { '@/lib/mongodb': { registrations: () => assert.fail('Database accessed'), database: () => assert.fail('Database accessed') } });
    const response = await handler[method](new Request('http://localhost/api/test', { method }));
    assert.equal(response.status, 401);
  });
}

test('authentication configuration failures never expose secrets to clients', async () => {
  const { authError } = load('src/lib/firebase-admin.ts');
  const response = authError(new Error('mongodb://user:secret@example private_key=secret'));
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /mongodb|private_key|secret|example/);
});

test('profile database failures return a generic response', async () => {
  const route = load('src/app/api/registration/me/route.ts', {
    '@/lib/firebase-admin': { authenticatedUser: async () => ({ uid: 'owner' }) },
    '@/lib/mongodb': { registrations: async () => { throw new Error('mongodb://user:secret@host'); } },
  });
  const response = await route.GET(new Request('http://localhost/api/test'));
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /mongodb|secret|host/);
});

test('profile uses token ownership rather than a user-supplied identifier', async () => {
  let filter;
  const route = load('src/app/api/registration/me/route.ts', {
    '@/lib/firebase-admin': { authenticatedUser: async () => ({ uid: 'owner' }) },
    '@/lib/mongodb': { registrations: async () => ({ findOne: async query => { filter = query; return null; } }) },
  });
  await route.GET(new Request('http://localhost/api/test?firebaseUid=victim'));
  assert.deepEqual(filter, { firebaseUid: 'owner' });
});

test('print pass escapes markup and attribute injection in participant data', () => {
  const { printPassCard } = load('src/lib/print-pass.ts');
  const before = { window: global.window, document: global.document, setTimeout: global.setTimeout };
  let output;
  global.window = {};
  global.document = { createElement: () => ({ style: {}, contentWindow: { document: { open() {}, write(html) { output = html; }, close() {} } } }), body: { appendChild() {} } };
  global.setTimeout = () => 0;
  try {
    printPassCard({ name: '</title><script>alert(1)</script>', sports: ['<img onerror=alert(1)>'], role: 'sports', photo: 'https://example.com/a" onerror="alert(1)', qr: 'javascript:alert(1)' });
    assert.doesNotMatch(output, /<script>|<img onerror=|src="javascript:|a" onerror="alert/);
    assert.match(output, /&lt;script&gt;/);
    assert.match(output, /&quot; onerror=&quot;/);
  } finally { Object.assign(global, before); }
});


test('streamed request size limits work without Content-Length', async () => {
  const { readJson, BodyTooLargeError } = load('src/lib/request-body.ts');
  const req = new Request('http://localhost', { method: 'POST', body: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(33)); controller.close(); } }), duplex: 'half' });
  await assert.rejects(readJson(req, 32), BodyTooLargeError);
});

test('support rejects oversized requests before any database connection', async () => {
  const route = load('src/app/api/registration/support/route.ts', { '@/lib/mongodb': { database: () => assert.fail('Database accessed') } });
  assert.equal((await route.POST(new Request('http://localhost', { method: 'POST', body: 'x'.repeat(12001) }))).status, 413);
});

test('authentication checks revocation and rejects an unverified email or non-admin', async () => {
  let verified = false;
  const { authenticatedUser, authenticatedAdmin } = load('src/lib/firebase-admin.ts', {
    'firebase-admin/app': { getApps: () => [{ name: 'smjv-server' }] },
    'firebase-admin/auth': { getAuth: () => ({
      verifyIdToken: async (token, revoked) => { assert.equal(token, 'token'); assert.equal(revoked, true); return { uid: 'not-a-committee-user' }; },
      getUser: async () => ({ uid: 'not-a-committee-user', email: 'user@example.com', emailVerified: verified }),
    }) },
  });
  const request = new Request('http://localhost', { headers: { authorization: 'Bearer token' } });
  await assert.rejects(authenticatedUser(request), /EMAIL_NOT_VERIFIED/);
  verified = true;
  await assert.rejects(authenticatedAdmin(request), /FORBIDDEN/);
});

function authService(currentUser, sdk = {}) {
  return load('src/lib/auth-service.ts', {
    './firebase': { auth: { currentUser }, googleProvider: {}, isFirebaseConfigured: true },
    'firebase/auth': sdk,
  });
}

test('Google registration links the entered password to the existing UID', async () => {
  const user = { uid: 'same-user', email: 'student@example.com', emailVerified: true, providerData: [{ providerId: 'google.com' }], reload: async () => {} };
  let linked;
  const service = authService(user, {
    EmailAuthProvider: { credential: (email, password) => ({ email, password }) },
    linkWithCredential: async (account, credential) => { assert.equal(account, user); linked = credential; return { user }; },
  });
  const result = await service.registerWithEmailPassword(' Student@Example.com ', 'StrongPass1!');
  assert.equal(result.ok, true);
  assert.equal(result.user.uid, 'same-user');
  assert.deepEqual(linked, { email: 'student@example.com', password: 'StrongPass1!' });
});

test('existing password sessions cannot silently accept a different form password', async () => {
  const user = { email: 'student@example.com', emailVerified: true, providerData: [{ providerId: 'password' }], reload: async () => {} };
  const service = authService(user, { signInWithEmailAndPassword: async () => { throw { code: 'auth/invalid-credential' }; } });
  assert.equal((await service.registerWithEmailPassword(user.email, 'DifferentPass1!')).ok, false);
});

test('failed password linking does not report registration success', async () => {
  const user = { email: 'student@example.com', emailVerified: true, providerData: [], reload: async () => {} };
  const service = authService(user, {
    EmailAuthProvider: { credential: () => ({}) },
    linkWithCredential: async () => { throw { code: 'auth/requires-recent-login' }; },
  });
  assert.equal((await service.registerWithEmailPassword(user.email, 'StrongPass1!')).ok, false);
});

test('login normalizes email while preserving the password exactly', async () => {
  let sent;
  const service = authService(null, { signInWithEmailAndPassword: async (_, email, password) => { sent = { email, password }; return { user: { email } }; } });
  assert.equal((await service.loginWithEmailPassword(' Student@Example.com ', ' password ')).ok, true);
  assert.deepEqual(sent, { email: 'student@example.com', password: ' password ' });
});

test('password reset normalizes email and does not disclose missing accounts', async () => {
  let email;
  const service = authService(null, { sendPasswordResetEmail: async (_, value) => { email = value; throw { code: 'auth/user-not-found' }; } });
  assert.equal((await service.resetAccountPassword(' Student@Example.com ')).ok, true);
  assert.equal(email, 'student@example.com');
});

test("cultural quota counts both routes together and separates branch/gender", async () => {
  const rows = Array.from({ length: 9 }, (_, i) => ({ branch: "pune", gender: "MALE", registrationStatus: "completed", role: i < 5 ? "cultural" : "sports", alsoParticipatesInCultural: i >= 5 }));
  let lockWrites = 0;
  const session = { withTransaction: async fn => fn(), endSession: async () => {} };
  const quota = load("src/lib/cultural-quota.ts", { "@/lib/mongodb": {
    database: async () => ({ collection: () => ({ updateOne: async (filter, update, options) => { if (update.$inc) { assert.equal(options.session, session); lockWrites++; } } }) }),
    mongoClient: async () => ({ startSession: () => session }),
  }});
  const collection = {
    countDocuments: async (query, options) => {
      assert.equal(options.session, session);
      assert.deepEqual(query.$or, [{ role: "cultural" }, { role: "sports", alsoParticipatesInCultural: true }]);
      return rows.filter(r => r.branch === query.branch && r.gender === query.gender && r.registrationStatus === query.registrationStatus && (r.role === "cultural" || (r.role === "sports" && r.alsoParticipatesInCultural))).length;
    },
    updateOne: async (filter, update, options) => {
      assert.equal(options?.session, session);
      rows.push({ branch: current.branch, gender: current.gender, registrationStatus: "completed", ...update.$set });
      return { matchedCount: 1 };
    },
  };
  let current = { firebaseUid: "new", branch: "pune", gender: "MALE", updatedAt: new Date() };
  await quota.completeRegistration(collection, current, { role: "sports", alsoParticipatesInCultural: true });
  await assert.rejects(quota.completeRegistration(collection, current, { role: "cultural" }), /CULTURAL_QUOTA_FULL/);
  current = { ...current, gender: "FEMALE" };
  await quota.completeRegistration(collection, current, { role: "cultural" });
  current = { ...current, branch: "ahmedabad", gender: "MALE" };
  await quota.completeRegistration(collection, current, { role: "cultural" });
  assert.equal(lockWrites, 4);
});

test("Vadodara and sports-only registrations bypass cultural quota", async () => {
  const quota = load("src/lib/cultural-quota.ts", { "@/lib/mongodb": {
    database: async () => { throw new Error("quota must not run"); },
  }});
  const collection = { updateOne: async () => ({ matchedCount: 1 }) };
  for (const fields of [{ role: "cultural" }, { role: "sports", alsoParticipatesInCultural: true }]) {
    assert.equal((await quota.completeRegistration(collection, { branch: "vadodara" }, fields)).matchedCount, 1);
  }
  assert.equal((await quota.completeRegistration(collection, { branch: "pune" }, { role: "sports", alsoParticipatesInCultural: false })).matchedCount, 1);
});

test("full cultural quota returns conflict and cleans up uploaded portraits", async () => {
  const f = finish({ countDocuments: async () => 10 });
  f.record.branch = "pune";
  // Load the handler with a controlled quota boundary to exercise its error response and cleanup.
  const route = load("src/app/api/registration/finish/route.ts", {
    "@/lib/firebase-admin": { authenticatedUser: async () => ({ uid: "uid1" }) },
    "@/lib/mongodb": { registrations: async () => ({ findOne: async q => q.imagePaths || q.jerseyNumber !== undefined ? null : f.record }) },
    "@/lib/cultural-quota": { completeRegistration: async () => { throw new Error("CULTURAL_QUOTA_FULL"); }, CULTURAL_FULL_MESSAGE: "Cultural registration is full" },
    "@/lib/supabase": { imageStorage: () => ({ storage: { upload: async () => ({}), remove: async paths => { f.state.removed.push(...paths); return {}; } } }), imageUrls: async () => [] },
  });
  const photo = await sharp({ create: { width: 2, height: 2, channels: 3, background: "white" } }).jpeg().toBuffer();
  const response = await route.POST(await request(photo, { alsoParticipatesInCultural: "true" }));
  assert.equal(response.status, 409);
  assert.match((await response.json()).error, /full/);
  assert.equal(f.state.removed.length, 1);
});

test("girls schedule preserves the new PDF times and boys schedule is unchanged", () => {
  const schedule = load("src/lib/schedule.ts");
  const sport = (day, name) => schedule.GIRLS_SCHEDULE[day - 1].sports.find(s => s.name === name);
  assert.deepEqual(sport(1, "BADMINTON").matches.map(m => m.time), ["12:00 PM – 1:00 PM", "12:00 PM – 1:00 PM", "1:00 PM – 2:00 PM", "1:00 PM – 2:00 PM"]);
  assert.equal(sport(2, "TUG OF WAR").matches[0].time, "7:00 AM – 7:15 AM");
  assert.equal(sport(2, "KHO-KHO").matches.at(-1).time, "12:00 PM – 1:00 PM");
  assert.equal(sport(3, "PICKLE BALL").matches[0].time, "7:30 PM – 8:30 PM");
  assert.equal(sport(3, "CARROM").matches[0].no, "6");
  assert.equal(schedule.BOYS_SCHEDULE[0].sports[0].matches[0].time, "12.00 – 2.30");
});


test("girls retain every previous team pairing and bye with the revised times", () => {
  const oldSource = require("node:child_process").execFileSync("git", ["show", "HEAD:src/lib/schedule.ts"], { encoding: "utf8" });
  const previous = { exports: {} };
  vm.runInNewContext(ts.transpileModule(oldSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: previous.exports });
  const current = load("src/lib/schedule.ts");
  for (const day of previous.exports.GIRLS_SCHEDULE) for (const sport of day.sports) {
    const labels = current.GIRLS_SCHEDULE.flatMap(d => d.sports.filter(s => s.name === sport.name).flatMap(s => s.matches.flatMap(m => m.pairings.map(p => p.label))));
    for (const match of sport.matches) for (const pairing of match.pairings) assert.ok(labels.includes(pairing.label), pairing.label);
  }
  assert.deepEqual(JSON.parse(JSON.stringify(current.GIRLS_BYES)), JSON.parse(JSON.stringify(previous.exports.GIRLS_BYES)));
});

test("QR payload encodes only opaque pass URL without personal details", () => {
  const { buildPassQrPayload, extractPassId, isValidPassId } = load("src/lib/pass-qr.ts");
  const id = "507f1f77bcf86cd799439011";
  const payload = buildPassQrPayload(`#${id}`, "https://smjv.example.com");
  assert.equal(payload, `https://smjv.example.com/pass/${id}`);
  assert.equal(extractPassId(payload), id);
  assert.equal(isValidPassId(id), true);
  assert.equal(isValidPassId("not-an-id"), false);
});

test("pass lookup hides personal details from anonymous callers and exposes profile to authorized staff", async () => {
  const { ObjectId } = require("mongodb");
  const id = new ObjectId("507f1f77bcf86cd799439011");
  const record = {
    _id: id,
    registrationStatus: "completed",
    isVerified: true,
    role: "sports",
    firstName: "Aarav",
    surname: "Mehta",
    mobile: "+919825040142",
    email: "aarav@example.com",
    grnumber: "GR-101",
    passNo: `#${id.toString()}`,
  };
  let isAdmin = false;
  const route = load("src/app/api/pass/[id]/route.ts", {
    "@/lib/mongodb": { registrations: async () => ({ findOne: async (q) => (q._id.toString() === id.toString() ? record : null) }) },
    "@/lib/firebase-admin": { authenticatedAdmin: async () => { if (!isAdmin) throw new Error("FORBIDDEN"); return { uid: "admin1" }; } },
    "@/lib/registration-profile": { registrationProfile: async (r) => ({ firstName: r.firstName, surname: r.surname, mobile: r.mobile, passNo: r.passNo, isVerified: r.isVerified }) },
  });

  const invalid = await route.GET(new Request("http://localhost/api/pass/bad"), { params: Promise.resolve({ id: "bad" }) });
  assert.equal(invalid.status, 404);

  const anonRes = await route.GET(new Request(`http://localhost/api/pass/${id.toString()}`), { params: Promise.resolve({ id: id.toString() }) });
  assert.equal(anonRes.status, 200);
  const anonJson = await anonRes.json();
  assert.deepEqual(anonJson, { valid: true, authenticated: false, verified: true, passRole: "PLAYER" });
  assert.equal(anonJson.pass, undefined);

  isAdmin = true;
  const staffRes = await route.GET(
    new Request(`http://localhost/api/pass/${id.toString()}`, { headers: { authorization: "Bearer valid-staff-token" } }),
    { params: Promise.resolve({ id: id.toString() }) }
  );
  assert.equal(staffRes.status, 200);
  const staffJson = await staffRes.json();
  assert.equal(staffJson.authenticated, true);
  assert.equal(staffJson.pass.firstName, "Aarav");
  assert.equal(staffJson.pass.mobile, "+919825040142");
});
