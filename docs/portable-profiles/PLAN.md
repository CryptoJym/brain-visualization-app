# Portable Cortex Compass profiles

Owner: ChatGPT. Task: eco-ii5x99. Branch: astra/cortex-portable-profiles. Base: a7b13ce. Production precondition: d2db14f6-a45c-46da-bdc0-df519fc5b926.

Outcome: preserve the person's reflection and accepted portrait together across browsers, without sending questionnaire data to the portrait service. Keep the existing private-pass pilot and scientific interpretation unchanged.

Implementation order: bounded file format and record validation; browser encryption; staged preview and consented restore; portrait-library edition fixes; unit and browser verification; publication with a native version check and rollback receipt.

A backup is a user-downloaded .cortex file, not a cloud account. It carries the validated profile, the accepted image, and a fictional-sample marker. The password is not recoverable by this app. Restoring first previews the backup, then requests explicit permission to replace the saved profile. On failure, the previous saved profile must remain unchanged.

Use built-in Web Crypto rather than custom cryptography: AES-256-GCM and PBKDF2-HMAC-SHA256, fixed work factor 600000, fresh salt and IV. Set strict file/record size and version bounds. A password-protected file does not protect an already compromised browser or device.

Verification: wrong passwords, modified or oversized files, unsupported versions, missing portrait bytes, save failures, consent boundaries, and exact image preservation. Test separate-browser restore, 320/390/768/1440 layouts, WebKit, and existing questionnaire/PDF flows. No paid image requests are needed.
