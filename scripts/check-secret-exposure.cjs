// Reports filenames only: never print credentials while checking for leaks.
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
require("@next/env").loadEnvConfig(process.cwd());
const secrets = [process.env.MONGODB_URI, process.env.SUPABASE_SECRET_KEY];
let account = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!account && process.env.GOOGLE_APPLICATION_CREDENTIALS) account = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, "utf8");
if (account) {
  let parsed = JSON.parse(account);
  if (typeof parsed === "string") parsed = JSON.parse(parsed);
  secrets.push(parsed.private_key, parsed.private_key?.replace(/\n/g, "\\n"));
}
const needles = secrets.filter(value => value && value.length > 16);
function check(label, files) {
  let failures = 0;
  for (const file of files) {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
    const content = fs.readFileSync(file, "utf8");
    if (needles.some(secret => content.includes(secret)) || /-----BEGIN (?:RSA )?PRIVATE KEY-----[\s\\nr]+[A-Za-z0-9+/]{40}/.test(content)) {
      console.error(`${label}: credential detected in ${file}`);
      failures++;
    }
  }
  console.log(`${label}: ${files.length} files checked, ${failures} findings`);
  if (failures) process.exitCode = 1;
}
const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
check("Tracked files", tracked);
function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
check("Public assets", walk("public"));
if (!fs.existsSync(".next/static")) throw new Error("Run npm run build before checking browser bundles");
check("Browser bundles", walk(".next/static"));
