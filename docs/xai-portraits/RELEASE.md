# xAI portrait integration

Status: implemented and locally verified; publication and live-generation receipt pending.

Owner: ChatGPT; task eco-fxdv65 (parent eco-a318wk). Worktree cortex-compass-xai-portraits, branch astra/cortex-xai-portraits. Baseline a784b77 / existing public Deep Hero Atlas. The neuroscience and questionnaire models are unchanged.

## Provider and custody

The authorized xAI key was located at Infisical utlyze-web/prod/XAI_API_KEY. Native xAI model discovery returned grok-imagine-image-2.0. The key was transferred directly through stdin into the encrypted Cloudflare Worker secret CORTEX_XAI_API_KEY. It is not in source, browser bundles, profiles, logs or this receipt. The same vault remains its source of truth.

Pinned image configuration: grok-imagine-image-2.0, medium, 2k, 3:4, one base64 image. Official current text-to-image price for that combination is $0.08; actual invoiced charges were not separately reconciled. One direct provider canary succeeded, producing a 6.6 MB fictional portrait. Its receipt and image are private local verification artifacts, not a personal case history. The final prompt additionally specifies 2D anime linework/cel shading rather than photorealism.

## Working product boundary

The new service is a PRIVATE-PASS PILOT, not public account registration or email-verified identity. Existing managed auth was absent, and the checked utlyze.com mail domain was not verified. No mail domain, unrelated identity provider, or public registration service was changed. Anonymous reflection/PDF printing remain available; paid image requests require a separately issued high-entropy workspace pass.

Owner pass: utlyze-web/prod/CORTEX_PORTRAIT_OWNER_PASS. Do not paste the pass or API key into public documentation. Grant metadata and verification-pass references are retained privately in .local-evidence/xai-portraits/access-metadata.json. Grant hashes, not raw passes, are deployed as CORTEX_PORTRAIT_ACCESS. Sessions use hashed server state and Secure/HttpOnly/SameSite=Strict cookies. A pass is a capability for its private portrait workspace, not a verified name/email account.

Owner allowance: 10 attempts; verification workspace: 1. Grants expire after 90 days. Global lifetime cap: at most 100 attempts; daily cap: 25. Reservations happen atomically before any provider request. Repeated request IDs/specifications reuse the existing job; conflicts fail. An interrupted running job is recovered from stored artwork or marked uncertain, never automatically submitted again. A deleted edition cannot be silently revived or rebilled; a new edition requires explicit selection.

Private bucket cortex-compass-private-portraits has r2.dev disabled and no enabled custom public domain, verified natively. Artwork and minimal visual specifications remain workspace-scoped. Image access is authenticated and no-store. Deleting a cloud image cannot recall device/PDF copies. The app only copies an accepted image into device storage when the reader clicks Use this portrait; it verifies the original hash and re-encodes the pixels using the existing bounded importer. Accepted pixels are reused for later PDFs without generating again.

## Privacy and testing

Only canonical hero IDs and enumerated appearance choices reach the backend; the server reconstructs the exact displayed visual prompt. Raw questionnaire data, free-text prompts, contact details, diagnoses, and research demographic variables are rejected. The UI separately discloses xAI processing/retention and asks explicit consent. No claim of zero provider retention, clinical inference or private-cloud storage of questionnaire answers is made.

203 unit/contract tests passed, including 34 provider/auth/storage/budget/idempotency tests. Local HTTPS Worker sign-in was tested with a synthetic grant. Eighteen browser checks passed using the actual application and a clearly marked simulated provider response carrying the real canary image. These included 320/390/768 layouts, image hash checking, PDF reuse, profile reopening and cloud-versus-device deletion. Existing hero, WebKit, report, developmental and branding regressions also passed (183 checks). Browser simulations are not the pending live provider/production storage proof.

## Release recovery

Native precondition must be refreshed after this task's three secret-provisioning operations, which can create new revisions of the previously deployed code. Preserve baseline release adb875e6-357a-487d-b792-93eb88577d74 and the existing private R2 data. Rollback the Worker code if needed; do not destroy the Durable Object namespace/bucket or silently reset the spending ledger. Disable new generation by setting PORTRAIT_TOTAL_LIMIT=0; saved portraits remain readable while valid grants are retained.
