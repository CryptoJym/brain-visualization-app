# Brain story evidence, 2026-10-06

These are local browser screenshots of the results page, taken in Chrome for Testing 148 from `dist` served through `worker/index.js` with the production headers and CSP (`scripts/serve-dist-with-worker.mjs`). The answers are synthetic: the fictional sample profile, a fresh test reflection and a no-link reflection. These are not production-user evidence. The baseline is `6b2d8c64471d9c13a952c6c177f8582f2f33355f`. Desktop captures are 1440×1000; phone captures are 375×812.

The images are cropped, scaled and captioned from real screenshots; the page content is unedited. The "after" screenshots come from `scripts/verify-brain-story.mjs` (255 checks passed, 0 failed, no console, CSP or network errors). The "before" screenshots come from the same section on the baseline build.

- **01-before-after-desktop.jpg**: The sample profile's anatomy section, before and after. After: the 3 linked structures highlighted together, others dimmed, a numbered legend and "Walk me through it".
- **02-before-after-phone.jpg**: The same on a phone. Before shows the section top. After shows the map with numbered labels, walkthrough stop 1 with the brain and its words on one screen, and the still steps shown to people who ask for less motion.
- **03-walkthrough-desktop.jpg**: All 3 walkthrough stops for the sample profile: playing, paused, and advanced with the keyboard.
- **04-fresh-reflection-map.jpg**: A fresh reflection with 4 Yes answers linked to region studies and 1 without (household incarceration). The map shows 7 structures, all visible and labelled.
- **05-fresh-reflection-stops.jpg**: The 7 stops of that walkthrough, covering surface, cutaway and see-through deep views.
- **06-reduced-motion-and-text.jpg**: Reduced motion opens the still step list and the camera stays put. Beside it is the full text version, with the same stops in the same order.
- **07-empty-state.jpg**: A reflection with no linked structures. It shows a calm explanation and the teaching brain still works.
