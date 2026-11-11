# Verify Oceans
Oceans - The Blue Planet: interactive ocean explorer (vite + React, vitest, playwright e2e).
## Launch
npm install, then npm run dev or npm run build && npm run preview.
## Doctor
`python3 .cursor/skills/verify-oceans/verify.py`
## Drive
Runs the vitest suite, builds with vite, renders the built app in headless Chromium asserting the boot marker and zero JS console errors.
## Evidence
`.cursor/skills/verify-oceans/evidence.json`
## Cleanup
Static server terminated after the render.
## Known boundaries
Render smoke only; scene quality and e2e suites not exercised here.
