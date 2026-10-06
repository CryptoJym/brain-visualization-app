# UX safety evidence — 2026-10-06

These are local browser screenshots of the pinned production source and the Lane A candidate, with synthetic test data. They are not production-user evidence. The baseline is `2aa769bc3728146a3bfa8801da0253b93c4293f8`; the candidate source is `3d677ccb136953538b587a58e6e8c53af9eda579`. Desktop captures are 1440×1000; phone captures are 375×812. The gold outlines show keyboard focus.

- **before-desktop-assessment.jpg**: Pinned base, assessment section 1, 1440×1000, top of page.
- **after-desktop-assessment.jpg**: Candidate, assessment section 1, 1440×1000, support closed.
- **before-mobile-assessment.jpg**: Pinned base, assessment section 1, 375×812, top of page; existing horizontal overflow.
- **after-mobile-assessment.jpg**: Candidate, assessment section 1, 375×812, scrolled to the synthetic No answer.
- **mobile-support-open.jpg**: Candidate, 375×812, keyboard focus on Call 988 with all support options visible.
- **after-desktop-report.jpg**: Candidate, report screen, 1440×1000, support closed.

The phone after image is deliberately scrolled to an answered question to show the sticky support area and unobscured answer targets. The support options expand in document flow. Full screen/section coverage, browser results and PDF evidence are in the handoff packet under `out/evidence/`.
