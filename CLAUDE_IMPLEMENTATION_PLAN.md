# Claude Implementation Brief: Production-Readiness Cleanup

## Role and objective

Act as a senior software engineer improving this existing Next.js repository for long-term production readiness and eventual high traffic.

Implement only the engineering changes described below. Do not add product features, screens, APIs, Firebase business logic, authentication flows, dashboards, maps, uploads, or placeholder application code.

Preserve the current landing page and its visible behavior unless a change is explicitly required here.

## Working rules

1. Inspect the current repository before editing.
2. Preserve unrelated user changes and do not rewrite files unnecessarily.
3. Prefer small, reviewable changes over speculative abstractions.
4. Do not install libraries unless they are necessary for a requested change.
5. Never add real credentials or secrets.
6. Do not weaken TypeScript or ESLint rules to make validation pass.
7. Use the existing package manager and update `package-lock.json` whenever dependencies change.
8. At the end, report every changed file, important decision, and validation result.

## Required changes

### 1. Modernize linting

- Replace the deprecated `next lint` and `next lint --fix` scripts with direct ESLint CLI commands.
- Use ESLint's native flat configuration where supported by the installed Next.js ESLint packages.
- Remove `@eslint/eslintrc` if it is no longer needed after the migration.
- Preserve the existing Next.js Core Web Vitals, TypeScript, Prettier compatibility, unused-variable, `no-explicit-any`, `prefer-const`, and console policies.
- Ensure generated directories and build artifacts are ignored by ESLint.

Expected scripts:

```json
"lint": "eslint . --max-warnings=0",
"lint:fix": "eslint . --fix"
```

Equivalent scripts are acceptable if they provide the same behavior.

### 2. Fix formatting

- Run Prettier over repository-owned source, configuration, and documentation files.
- Do not format generated artifacts or `package-lock.json`.
- Ensure `npm run format:check` passes.

### 3. Tighten TypeScript safely

Update `tsconfig.json` as follows:

- Set `allowJs` to `false` because the application source is TypeScript.
- Enable `noUncheckedIndexedAccess`.
- Enable `exactOptionalPropertyTypes` only if the installed Next.js types and current source pass without casts, suppressions, or workarounds. If it causes framework compatibility errors, leave it disabled and document why.
- Preserve `strict`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, and `forceConsistentCasingInFileNames`.
- Do not disable `skipLibCheck` merely for appearance; assess it. Keep it enabled if disabling it exposes third-party declaration problems rather than application defects, and document the result.
- Keep the `@/*` alias working.

### 4. Remove unjustified hydration suppression

- Remove `suppressHydrationWarning` from the root `<html>` element in `src/app/layout.tsx`.
- Do not introduce client-side theme code or other behavior to replace it.

### 5. Add baseline HTTP security headers

Add production-safe response headers in `next.config.ts` using Next.js `headers()`:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` denying unused sensitive capabilities such as camera, microphone, and geolocation
- `X-Frame-Options: DENY`, unless an equivalent CSP `frame-ancestors` policy is implemented

Also add HSTS only in production so local HTTP development is unaffected:

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Do not add a guessed Content Security Policy in this pass. A correct CSP must be designed alongside the actual Google Maps, Firebase, analytics, and image integrations; an inaccurate policy would either break them or become overly permissive. Add a short comment in the configuration explaining this deferral.

Apply headers to all routes.

### 6. Restrict remote image configuration

- Review the three `images.remotePatterns` entries in `next.config.ts`.
- Add safe pathname restrictions wherever a stable pathname is known.
- Do not invent a Firebase project ID or hard-code a placeholder hostname into runtime configuration.
- If a hostname cannot be narrowed safely before the actual integration exists, keep the hostname allowlist and add a concise TODO explaining that it must be narrowed when the concrete storage paths are known.
- Do not remove an entry solely because it is not used by the current landing page; the environment contract indicates planned integrations.

### 7. Resolve the upload-limit configuration contradiction

The repository currently has a 5 MB Server Action body limit and a 10 MB image limit in `.env.example`.

- Do not implement uploading.
- Do not increase the Server Action limit to 10 MB.
- Remove the speculative `experimental.serverActions.bodySizeLimit` configuration if no Server Action currently needs it, allowing the framework default to remain in effect.
- Add a concise comment near the image-upload environment variables stating that production uploads should go directly to restricted object storage using short-lived authorization, rather than pass through Server Actions.

### 8. Improve environment documentation and secret guidance

Update `.env.example` comments without changing the public contract unnecessarily:

- Clearly distinguish browser-exposed `NEXT_PUBLIC_*` values from server-only secrets.
- State that Firebase web configuration is public configuration and must be protected through Firebase Security Rules, authorized domains, quotas, and App Check—not treated as a secret.
- State that Google Maps browser keys must have HTTP referrer and API restrictions.
- Recommend workload identity or platform-managed credentials for production Firebase Admin, Vertex AI, BigQuery, and Earth Engine access instead of long-lived private keys where supported.
- Preserve placeholder values only; never add working credentials.
- Clarify that rate-limit environment variables do nothing until enforced by shared infrastructure or a distributed store. Do not implement rate limiting in this task.

### 9. Add Firebase-readiness documentation only

Create `docs/firebase-readiness.md`. This is documentation, not an implementation request.

Cover the minimum standards future Firebase work must follow:

- Separate server-only Admin SDK initialization from browser SDK initialization.
- Validate required environment variables at process startup.
- Use singleton initialization to avoid duplicate app instances during development and server execution.
- Enforce authorization in Firestore and Storage Security Rules; UI checks are not security boundaries.
- Require App Check for supported production resources.
- Keep Firestore queries aligned with explicit indexes.
- Avoid sequential document IDs, unbounded arrays, oversized documents, hot counters, and unbounded listeners.
- Use transactions or atomic operations only where consistency requires them.
- Use direct-to-Storage uploads with content type, size, ownership, and path constraints.
- Test rules through the Firebase Emulator Suite in CI before deployment.
- Prefer workload identity/platform credentials over committed or broadly distributed service-account keys.
- Separate development, staging, and production Firebase projects.

Do not add Firebase packages, config files, rules, indexes, emulators, or initialization modules yet because no Firebase-backed implementation exists.

### 10. Add architecture guidance without speculative scaffolding

Create `docs/architecture.md` describing the intended organizational rules for future implementation:

- Keep `src/app` focused on routes, layouts, loading/error boundaries, and route handlers.
- Organize business implementation by domain under `src/features/<domain>` when domains actually exist.
- Put genuinely reusable presentational primitives under `src/components/ui`.
- Put server-only adapters and infrastructure integration under clearly named `src/lib` modules, with `server-only` boundaries where appropriate.
- Keep validation schemas at trust boundaries.
- Keep external API calls on the server unless a browser SDK is required.
- Prefer server components and static rendering by default; introduce client components only at interactive boundaries.
- Prevent large map, chart, editor, or SDK bundles from entering shared layouts; dynamically load them at the route/component boundary when eventually needed.
- Separate synchronous request handling from expensive ingestion, image processing, prediction, alerting, and analytics workloads.
- Require idempotency, bounded retries, backpressure, observability, and dead-letter handling for future asynchronous work.

Do not create empty folders or placeholder source files for this proposed structure.

### 11. Add a minimal CI quality gate

Create a GitHub Actions workflow that runs on pull requests and pushes to the primary branch.

It must:

1. Check out the repository.
2. Install the supported Node.js LTS version with npm caching.
3. Run `npm ci`.
4. Run formatting check.
5. Run lint.
6. Run TypeScript checking.
7. Run the production build.

Do not add deployment, Firebase deployment, preview environments, or secret-dependent steps.

Add a Node.js engine declaration to `package.json` that matches the selected CI runtime and is supported by the installed Next.js version. Prefer Node 22 LTS unless repository constraints require Node 20.

### 12. Handle the dependency vulnerability carefully

- Run `npm audit` and record the result in the final report.
- The known report may identify PostCSS `<8.5.10` nested under Next.js and may suggest an invalid downgrade to Next 9. Do not perform that downgrade.
- Check whether a compatible patched Next.js version is available.
- If a normal compatible Next.js upgrade resolves the advisory, update Next.js and the matching `eslint-config-next`, then rebuild and retest.
- If no compatible upgrade resolves it, do not force a risky transitive override without proving compatibility. Leave dependencies unchanged and document the advisory and remediation dependency clearly.
- Do not use `npm audit fix --force`.
- Keep React and React DOM on identical versions.
- Remove only dependencies proven unused after the lint migration; do not broadly prune tooling.

### 13. Improve repository documentation

Expand `README.md` with concise engineering setup information:

- Prerequisites and supported Node.js version
- Installation and local development commands
- Type-check, lint, format-check, and production-build commands
- Environment setup using `.env.example`
- A clear statement that the repository is currently a foundation/landing page and Firebase integrations are not implemented
- Links to the two new architecture documents

Do not describe unimplemented capabilities as available.

## Explicitly out of scope

Do not implement any of the following:

- Firebase initialization or dependencies
- Authentication or authorization flows
- Firestore or Storage rules
- API routes or Server Actions
- Upload functionality
- Rate limiting
- Maps, dashboards, analytics, monitoring SDKs, or error-reporting SDKs
- New UI components or pages
- Product features
- Database schemas
- Deployment configuration
- A speculative Content Security Policy
- Empty architectural folders

## Required acceptance checks

Run all of the following from the repository root:

```bash
npm ci
npm run format:check
npm run lint
npm run type-check
npm run build
npm audit
```

Acceptance criteria:

- Formatting, linting, type checking, and production build pass.
- ESLint emits no warnings and does not invoke `next lint`.
- The landing page remains statically rendered and visually unchanged.
- No real secret is present in the diff.
- No product feature is added.
- CI contains no secret-dependent or deployment steps.
- Any unresolved audit advisory is explicitly reported with its dependency path and safe remediation plan.

## Final response format

After implementation, respond with:

1. A concise summary of completed changes.
2. A file-by-file change list.
3. Validation results for every required command.
4. Any unresolved vulnerability or compatibility issue.
5. Any decision where the requested change was deliberately not made, with the technical reason.

