# 06 — Verification, production operations and recovery

## Evidence already obtained
The latest release completion record is `docs/hero-editions/COMPLETION.md`. It records 253 unit/contract tests and 281 final live checks across nine suites: hero editions 35, edition WebKit 12, hero 38 after a clean retry, older WebKit flow 11, reports 51, development 40, portable backups 30, portrait editions 21 and branding 43. The prior broad hero attempt had a selector timeout; its passing retry does not establish the cause with certainty. Retain both receipts and investigate recurrence. Do not rewrite the failed result as if it never occurred or claim one transient failure proves there is no product defect.

The release checked actual public HTML, main CSS/JS, report index and selected sample PDF hashes against the tested artifact. The handoff re-read native Cloudflare and confirmed `e127727f-f809-4b6f-85ca-fa7e7f67b75d` at 100% traffic. A current native version read is a new observation; historical browser suites are prior evidence, not a fresh all-browser test on every handoff. No deployment or paid generation is part of this preservation task.

The xAI release earlier proved a real provider image through the live Worker and real authentication in Chromium. Some WebKit and library/edition cases intentionally use synthetic workspace responses and an existing real image. Browser-test fixtures are not fresh provider calls or real user profiles. WebKit device emulation is not a physical iPhone/printer certification. PDF assertions check content, page boundaries and embedded image readiness; visual inspection remains necessary.

## Paths and commands
From the appropriate worktree, `npm test` runs `tests/*.test.mjs`; `npm run check:anatomy` checks teaching assets; `npm run build` creates `dist`. Use `npm ci` for a fresh checkout, not a symlink copied from another machine. `scripts/run-hero-edition-checks.mjs` orchestrates the nine local/live suites and accepts `CORTEX_TEST_ORIGIN` and `CORTEX_CHECK_OUTPUT`. Run from the repo root; several older scripts resolve fixture files relative to the current directory. `scripts/verify-hero-editions.mjs`, `verify-hero-editions-webkit.mjs`, `verify-portable-profiles.mjs`, `verify-portrait-editions.mjs` and `verify-neurohero-v9.mjs` are the key acceptance flows.

`report-pdf-export-v6.mjs` explicitly switches print media, waits for foreground and atmospheric image readiness, waits for fonts and decodes images before PDF creation. Do not remove these waits to make a timing test pass. `export-hero-edition-samples.mjs` exports explicitly fictional reports using the existing public image; `audit-hero-edition-pdfs.py` checks those files; `edition-contact-sheets.mjs` prepares visual-review sheets. The audit script may be ignored by broad repository ignore rules but is retained in the local recovery residue snapshot. If absent in a fresh clone, use the documented acceptance criteria and preserved script, not a fabricated pass.

Raw receipts remain in `.local-evidence/hero-editions/`, with `final-checks`, live-suite outputs, source snapshots, PDF audit/render folders and public-hash evidence. Earlier milestone receipts remain in their original worktrees. These directories are not all in Git and can include synthetic access fixtures or operational detail; do not bulk-upload them to a public site. The handoff's sanitized state and file-hash manifest identify what was preserved without copying credentials or browser profiles.

## Native deployment verification
Use the already configured Wrangler installation and keyring flow; do not print tokens. Example read-only command:
```sh
CLOUDFLARE_AUTH_USE_KEYRING=true WRANGLER_SEND_METRICS=false \
 /Users/utlyze/Projects/freely-sweet/node_modules/.bin/wrangler deployments list \
 --config /Users/utlyze/Projects/cortex-compass-hero-editions-20260913/wrangler.jsonc --json
```
`wrangler deploy --dry-run` validates/builds but does NOT upload/promote production; earlier chat wording that assets were uploaded in a dry-run was incorrect. Do not mistake a GitHub push, branch merge, Worker upload or unverified version for a complete release. Native API readback and public artifact/user-flow checks are the release proof.

## Release and rollback
Freeze the exact accepted source/dist/config and record hashes. Immediately before publishing, compare the native predecessor against the recorded version. Existing publish/freezing helpers contain the PRIOR release predecessor `6fc5170e...` and fixed test thresholds; they are historical guards, not general-purpose scripts to run unchanged. Their current guard should stop a stale rerun. Reconcile a new predecessor and acceptance manifest deliberately; never simply delete the check. Use one release owner. Preserve the currently working version and all bound R2/Durable Object data. Rollback code/assets through the native version mechanism without deleting private storage or resetting spent quotas. Reverify after rollback.

## Secrets and accounts
The server key is `CORTEX_XAI_API_KEY`, sourced through the existing Infisical/helper infrastructure; the original xAI source reference is `utlyze-web/prod/XAI_API_KEY`. Access grants/rate salt are distinct Worker secrets. Owner workspace pass reference: `utlyze-web/prod/CORTEX_PORTRAIT_OWNER_PASS`. Gamma reference: `new-reward/prod/GAMMA_API_KEY`. These are reference names, not values. Do not place key/pass values, cookies, browser sessions, vault exports or real questionnaire data into handoff docs, Git, prompts, test logs or downloaded archives. Account/grant expiry, image balances and current provider prices must be checked when needed, not assumed from an old receipt.
