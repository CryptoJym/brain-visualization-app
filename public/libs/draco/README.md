# Draco decoder (self-hosted)

These files decode the Draco-compressed Cortex Compass brain models (`/models/cortex-brain-v6-*.glb`)
in the browser through three.js `DRACOLoader`. No outside CDN is used.

- `draco_wasm_wrapper.js`, `draco_decoder.wasm`: the glTF build used by default.
- `draco_decoder.js`: pure-JavaScript fallback, downloaded only if WebAssembly cannot start.

Copied unchanged from `three@0.158.0/examples/jsm/libs/draco/gltf/`.
Draco is Copyright Google LLC, licensed under the Apache License 2.0 (`LICENSE-Apache-2.0.txt`;
https://github.com/google/draco).
