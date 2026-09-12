# Cortex Compass approved-logo release

Status: local verification complete; native publication receipt pending.

Scope: approved brain-and-compass logo in every site header, reflection page, overview footer and both report mastheads. SVG/ICO/PNG favicons, Apple touch icon, maskable home-screen artwork, versioned metadata and branded sharing image are included. Assessment rules, research data and Worker security policy remain unchanged.

Source artwork: cortex_compass_neuroscience_logo.png; SHA-256 b70cd1736c5ddb91e6218b263ad2a32b65e66eb1b1085e255de9d856f0c5f2fd. Vector contours retain the approved emblem and wordmark, with small-size simplification and a lighter palette on dark backgrounds. Tiny icons use only the emblem. No external fonts are loaded.

Shared component: src/components/CortexBrand.jsx. Asset version: cc-brand-20260912. The manifest uses browser display and does not claim offline support.

Acceptance so far: 88 unit/contract tests, 51 report/mobile tests, 13 WebKit/iPhone-emulation tests and 41 initial brand checks all pass. The final asset check also covers the two newly branded sample PDFs. Layouts were checked at 320, 390, 768 and 1440 pixels. No page or console errors in successful browser suites.

PDFs: 2-page Superhero and 22-page Scientific samples in both A4 and Letter, with text bounds/content checks passing. Samples contain only the built-in fictional profile. Light logo variants print on white paper; dark-background variants appear in navigation.

Owned branch: astra/cortex-logo-20260912. The original v6 worktree is preserved. This branch also preserves the previously deployed v6 source snapshot, which had not yet been committed upstream.

Prior native Worker version: 46935ccd-8683-4f22-922b-543bdfc6eae6. Publication must require this exact prior version and preserve it for rollback. Existing Worker/domain only: cortex-compass / cortexcompass.utlyze.com.

Evidence: .local-evidence/brand. Mobile testing is browser/WebKit emulation, not physical-device native printing.
