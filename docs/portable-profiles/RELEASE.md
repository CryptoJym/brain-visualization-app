# Portable profiles and portrait editions

Status: implemented and locally verified; publication and public recheck pending.

Branch: astra/cortex-portable-profiles. Work item: eco-ii5x99. Studio working copy: /Users/utlyze/Projects/cortex-compass-portable-profiles. Required predecessor: d2db14f6-a45c-46da-bdc0-df519fc5b926.

The welcome screen now offers Open a backup. The overview offers Backup / restore. Reports offer Backup reflection & portrait. A user-downloaded .cortex file carries the normalized reflection and the accepted portrait when included.

The file uses Web Crypto AES-256-GCM with PBKDF2-HMAC-SHA256 at 600,000 iterations, fresh 16-byte salt and 12-byte IV, and authenticated version header. Passwords are not saved or recoverable by the service. The interface explains weak-password and compromised-device limitations.

Import is preview first, then an explicit choice to open the reflection. The saved profile is not replaced by importing. The reader separately chooses Save profile afterward. Included artwork is restored under a new local identifier without changing the accepted image bytes. This safer open/preview/save boundary replaces the initial plan's automatic replacement step.

Wrong passwords, modified files, unsupported versions, missing images and size violations are rejected. Image exclusion is explicit. Changing export options invalidates the old download link. Fictional sample labels are preserved.

The portrait library selects existing accepted editions on reopen, reuses them without a generation request at zero allowance, and asks for fresh consent on new editions. Different saved artwork requires acknowledgment without changing answers or hero identity. Progress updates within a running job; late responses cannot undo sign-out.

## Verification

235 unit/contract tests passed. Cryptographic output was cross-checked with an independent Node implementation. Tests cover wrong passwords, tampering, bounds, versions, image hashes, provenance and no-network behavior.

234 local browser checks passed: backup 30, editions 21, hero 38, hero WebKit 11, reports 51, development 40 and branding 43. Chromium downloaded an actual file, opened it in an independent browser profile, preserved the prior saved record, and explicitly saved/reopened the restored reflection with the same image hash. WebKit/iPhone emulation decrypted the Chromium file, displayed the artwork and exercised print. No physical-device or printer validation is claimed.

Edition tests used a simulated private library and the existing fictional portrait. No paid images were generated. No questionnaire answers were uploaded. The provider backend, Worker configuration and neuroscience data are unchanged from a7b13ce. The restored two-page PDF includes the portrait; both pages were rendered and visually checked.

The xAI service remains the existing private-pass pilot. This release does not create public email accounts, cloud questionnaire storage or new inference rules. Preserve portrait storage and quota state during any rollback. Local evidence is under .local-evidence/portable-profiles and is not part of public assets.

Technical references: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey and https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html . Password work-factor guidance informed file encryption, not a new authentication service.
