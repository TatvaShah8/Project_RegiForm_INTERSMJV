# Local setup and audit

The application is a single Next.js app: frontend pages and Node.js API routes run together with `npm run dev` at http://localhost:3000. The original UI and styling are preserved. No separate backend server or permissive CORS configuration is needed; browser API calls use same-origin `/api/registration/*` URLs.

## Audit findings and changes

- Firebase client configuration contained a hardcoded project and API key, and always reported itself configured. Configuration now comes exclusively from environment variables and missing settings produce a sign-in error instead of initializing an unrelated fallback project.
- No Firebase Admin credential was present locally. The previous default credential fallback failed on a normal workstation, and all Admin failures were presented as HTTP 401. Server initialization is now lazy, checks project consistency, and distinguishes configuration failures (503), unauthorized sessions (401), unverified email and unauthorized committee access (403).
- Existing-email registration could fail instead of authenticating and resending verification. It now signs in with the supplied password. Removed the shared fallback password and the unsafe resend-to-whichever-user-is-active behavior. Email verification reloads the user and refreshes the ID token.
- Google sign-in incorrectly required an application password and unconditionally marked email verified. Password is required only for email signup; verification follows Firebase. Editing the email clears the verification flag.
- Login could accept local/demo profiles without real authentication; it could not recover a MongoDB registration. Removed demo login and plaintext account caches, added authenticated profile retrieval and Firebase session restoration, and connected logout to Firebase. Sign-in now requires Firebase email/password or Google; GR numbers remain registration identifiers, not authentication credentials.
- Persisted browser flags could claim registration completion and committee approval. These flags are no longer persisted, older state is migrated, and the server profile is authoritative. Obsolete test completion and fake OTP actions were removed.
- MongoDB connected during module import, retained rejected connections, used a hardcoded database fallback, and had no code-enforced uniqueness. Connections are lazy and retryable; UID/email/phone/GR and branch+gender+jersey indexes protect concurrent writes. Required database name comes from the environment. Existing duplicates or conflicting indexes must be reviewed before index creation can succeed; the app does not delete existing records or indexes.
- API validation accepted arbitrary kits, sports, dates and text values. Zod schemas enforce field types, lengths, enums, valid dates, real phone numbers, category-specific sports, unique selections and quotas. Errors return 400/409 instead of being treated as successful submissions.
- General details and finalization had concurrent-update hazards. Conditional updates now use the record version timestamp. Completion is idempotent and returns the stored MongoDB profile to the UI; pass identifiers derive from the MongoDB record.
- Supabase assumed a public bucket and generated inaccessible public URLs for the actual private bucket. Bucket visibility is now detected. Private images use signed URLs refreshed when loading a profile and periodically during an active session. MongoDB stores both object paths and returned URLs; stored signed URLs expire and must be regenerated from the paths.
- Uploads trusted the declared MIME type. The server now decodes and re-encodes JPEG/PNG/WebP images with Sharp, bounds file count/size/pixels, uses unique user-scoped object paths, and removes uploads after failed writes. If MongoDB may have committed, cleanup first checks whether those images are referenced. If MongoDB cannot be checked, the objects are retained and paths are logged for reconciliation.
- Support tickets and committee verification were local-storage demonstrations. They now persist in MongoDB, with server-enforced Firebase UID authorization for committee reads/writes. Support submission remains public as in the existing contact page. Replies still open an email draft; the app does not send email itself.
- Build configuration ignored TypeScript errors. That suppression was removed. Missing core runtime dependencies were not found in the supplied package manifest; existing Firebase Admin/MongoDB/Supabase dependencies are retained. Node 22+ is declared.
- Lint included a vendored jsQR bundle and flagged existing hydration/modal-reset effects. The vendored file is excluded; effect advisories remain warnings. Fixed scanner function-order diagnostics and stale camera acquisition after modal closure. CommonJS test/tool scripts explicitly permit require imports.
- The credential scratch file was not ignored. Credential-file ignore patterns were added. Real `.env` files, credentials, local databases, dependency folders and build output are excluded from the deliverable archive.

## Configure

1. Install Node.js 22 or newer. Run `npm ci` using the supplied package-lock.json.
2. Use `.env.local.example` as the exact template for `.env.local` in the repository root. Merge missing settings if `.env.local` already exists; do not overwrite working credentials. The optional DATABASE_URL supports the repository's unused Prisma/SQLite tooling; registration uses MongoDB exclusively. Separate MONGODB_USERNAME/MONGODB_PASSWORD variables are not consumed; credentials belong in the URI.
3. Firebase: enable Email/Password and Google under Authentication providers. Add `localhost` to Authentication > Settings > Authorized domains. Use the same Firebase project for web configuration and the Admin service account. Set either an absolute `GOOGLE_APPLICATION_CREDENTIALS` JSON path or `FIREBASE_SERVICE_ACCOUNT_JSON`. Keep private keys server-only. Put committee user UIDs into `ADMIN_FIREBASE_UIDS`; empty means nobody has committee access.
4. Atlas: confirm the cluster is active, the database user has read/write and index-creation permissions for MONGODB_DB, and this machine's public IP is in Network Access. URL-encode credentials in MONGODB_URI. The observed connection failed with TLS alert INTERNAL_ERROR on all three hosts. Network access, firewall/VPN/TLS interception or cluster configuration need checking; certificate validation was not disabled.
5. Supabase: keep the existing bucket. Set SUPABASE_URL, a server secret/service-role key, and SUPABASE_BUCKET. The existing bucket was verified private and is preserved. No browser Supabase key or public write policy is necessary. Image uploads are authenticated through Firebase on the Next.js server.
6. Restart `npm run dev` after environment changes. Run `npm run check:services` for sanitized, read-only connectivity checks (the Firebase check requests an OAuth access token but never prints it).

## Verification checklist

1. Run `npm test`, `npm run lint`, and `npm run build`.
2. Run `npm run check:services`; resolve any failed check before the live registration test.
3. Run `npm run dev` and open http://localhost:3000/register.
4. Register with an email and password, follow the Firebase verification link, and click Check Status; alternatively sign in with Google. Enter identity fields and proceed. Confirm a UID-linked document appears in MongoDB `registrations`.
5. Save general details, upload a portrait, choose valid kit sizes/sports and an available jersey number, and finalize. Cultural participants finish on step 3 with no sports selections.
6. Confirm the document contains completed status, all form fields, imagePaths, imageUrls and passNo. Confirm the matching image exists in the configured Supabase bucket and displays on the pass. For a private bucket, use a newly fetched signed URL rather than an old MongoDB URL.
7. Sign out, reload, and sign in in another browser. Confirm the stored profile and photo return from the server. Try a second account with the same jersey in the same branch/gender: it must receive a conflict. Verify another branch/gender can use that number.
8. Submit a contact issue and verify it in MongoDB `supportTickets`. Sign in as an allowlisted committee user before opening the support/verification dashboards. A normal student must receive 403 from committee APIs; anonymous requests must receive 401.

## Verified and outstanding

- Production build and TypeScript checks passed during implementation; dev startup and registration page HTTP 200 were verified.
- Nine isolated tests exercise real handlers/validation with mocked service boundaries. They cover image linking, forged image rejection, cleanup, ambiguous commits, duplicate jerseys, idempotency and missing authentication. These are not a substitute for the live three-service registration test.
- Live Supabase upload, signed-URL download and cleanup passed using a synthetic temporary image.
- Browser checks verified homepage, login required-field feedback, team selector and account form. Live Firebase sign-in was not completed.
- Live MongoDB writes and the complete authenticated submission remain unverified: Atlas TLS connectivity failed and no Admin credential was supplied. The exact original Firebase error message has not been supplied, so its complete root cause is not established.
- Existing hydration/modal-effect lint warnings remain advisory. QR networking contacts remain a local browser convenience; they are not a registration or administrative database. Static schedules/rules and the unused Prisma example remain unchanged.
- Process termination between Supabase upload and MongoDB write can leave orphaned objects; a production reconciliation job would be needed for crash-level guarantees. Public contact intake would need deployment-specific spam/rate controls before broad production exposure.

## Assumptions awaiting confirmation

The configured Firebase project and MongoDB database are the intended services. Supabase images remain private. Firebase email/password and Google are the intended sign-in methods; phone/SMS verification is not implemented and is no longer advertised. Committee membership is defined by explicit Firebase UID allowlisting. Please provide the exact original Firebase error and confirm service configuration locally before considering end-to-end verification complete.

Reference: [Firebase Admin token verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens) and [Supabase bucket access](https://supabase.com/docs/guides/storage/buckets/fundamentals).
