# Security review — 22 November 2026

## Result and scope

Security-focused review of the frontend, all registration/support/admin API routes, Firebase authentication, MongoDB access, Supabase uploads, printing, environment handling and dependencies. This is not a penetration-test certification or a guarantee against every attack. Changes are local and require a new Vercel deployment.

No current server credentials were found in the checked tracked files, public assets or rebuilt browser bundles. A separate scan of all 51 reachable Git commits found no exact matches for the current MongoDB URI, Supabase secret or Firebase private key, or recognizable PEM private-key bodies. This cannot rule out older/revoked credentials or differently encoded secrets.

Firebase web configuration, including its API key, remains visible by design. It identifies the Firebase project; backend database access is enforced through verified user tokens and server-side authorization. Hiding or disabling Inspect Element cannot secure an application. See [Firebase's API-key guidance](https://firebase.google.com/docs/projects/api-keys).

## Findings fixed

- Registration and authentication errors returned raw internal exception messages. Responses now use generic messages; affected server logs no longer print raw credential/configuration exceptions.
- The printable ID pass interpolated participant data directly into HTML. Text and attributes are now escaped and image URL schemes restricted, preventing injected markup from executing in the print document.
- Committee printing sent a student's registration number to an external QR-generation service. QR images are now generated locally with the existing library.
- Request bodies could be fully buffered before limits were checked. JSON and multipart bodies now have streamed byte limits, including when Content-Length is absent.
- MongoDB index creation failures were silently ignored. Registration waits for required constraints and fails closed if they cannot be established; subsequent calls may retry.
- No explicit security headers were configured. Responses now add framing, content-type, referrer, base-URL/object and permissions restrictions. API responses use no-store. This is a partial CSP, not a comprehensive script nonce policy.
- A local .env file was tracked. It is removed from Git's index while retained on disk; broader environment-file ignores preserve example templates. Historical commits are not rewritten.
- Dependency audit initially reported 12 findings (5 high, 7 moderate). Updated Sharp, patched compatible dependencies and overrode the vulnerable transitive gRPC package. No forced Firebase downgrade was applied.
- Removed photo compression sizes/percentages, resolution/optimization text and database-provider names from registration messages. Compression still operates internally; users see “Photo ready” and “Your registration is complete. Your ID pass is ready.”

## Verification

- 39 tests pass: validation, image validation/cleanup, identity field mapping, registration persistence, anonymous endpoint denial, token ownership, revocation verification, unverified/non-admin rejection, internal-error redaction, print injection and streamed-body limits.
- Production build and TypeScript pass.
- ESLint: zero errors, 12 existing React effect warnings.
- Production server: /register returns 200; 20 anonymous/forged-token checks across protected methods return 401; /.env and /.env.local return 404; security headers are present and API cache policy is no-store.
- Secret scan: 197 tracked files, 16 public assets and 84 rebuilt browser assets checked without findings. New source files were also reviewed; the repeatable scanner covers tracked files once committed.
- MongoDB connection passes; existing unique indexes match UID, email, phone, GR number and branch/gender/jersey constraints.
- Supabase bucket metadata confirms private access. An unsigned public URL request for an existing portrait was rejected with HTTP 400.
- Firebase Admin credential check passes and matches the frontend project.
- No real registration was created or modified during this review. Persistence tests use controlled service mocks; cloud checks were read-only.

## Environment rules

Keep these exclusively server-side in .env.local and Vercel environment settings, without a NEXT_PUBLIC_ prefix:

- MONGODB_URI, MONGODB_DB
- SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_BUCKET
- FIREBASE_SERVICE_ACCOUNT_JSON (Vercel), or GOOGLE_APPLICATION_CREDENTIALS (local path)
- ADMIN_FIREBASE_UIDS (comma-separated trusted committee UIDs)

NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID and NEXT_PUBLIC_FIREBASE_APP_ID are public frontend configuration. The existing .env.local.example remains the configuration template. No new environment variables are required by these changes.

Supabase secret/service-role keys bypass RLS and must never be sent to the browser. See [Supabase API-key guidance](https://supabase.com/docs/guides/getting-started/api-keys). A signed-in user's own Firebase token and their temporary signed photo URL will be visible to that user. Signed image links are usable by anyone holding the link until expiry (currently one hour); they are not database credentials.

## Cloud settings still requiring verification

1. Redeploy the updated project. Local source changes do not update the existing Vercel site.
2. In Google Cloud, restrict the Firebase browser key to required Firebase APIs. In Firebase Authentication, retain only intended authorized domains and providers. Firebase database/storage rules must deny unused client access. These console settings were not available for inspection.
3. In Atlas, verify the app database user's least-privilege permissions and IP access list. Prefer known hosting egress IPs/private networking where your hosting supports it. The code no longer recommends opening access to 0.0.0.0/0. Current Atlas network/IAM settings were not inspected.
4. Keep the Supabase bucket private and verify that storage policies do not permit broad anonymous/authenticated reads or writes. Bucket privacy and public-link denial were checked; SQL/RLS policy definitions were not inspected.
5. Enable suitable rate limits/bot protection at the hosting edge, especially for public POST /api/registration/support and registration/authentication traffic. Body limits prevent oversized requests but do not stop high-volume spam. There is no distributed application rate limiter or CAPTCHA in this change.
6. ADMIN_FIREBASE_UIDS is empty in the local environment, so committee endpoints deny everyone locally. Configure trusted UIDs if committee access is needed; never replace the server check with a frontend flag. Vercel's value was not inspected.
7. Participant drafts are saved in browser local storage; passwords, verification codes and photo data are excluded. Users of shared devices should log out. Existing ID-pass QR networking data is shareable by design and should be reviewed separately if the event's privacy requirements change.

## Repeatable checks

```sh
npm install
npm test
npm run build
node scripts/check-secret-exposure.cjs
npm audit
npm run check:services
npm run dev
```

After deployment, upload a photo and complete a registration with a test account. Confirm the generic messages, saved profile reload and printable ID pass. Repeat the anonymous API checks against the deployed URL. Continue dependency monitoring: a clean audit only reflects known advisories at check time.
