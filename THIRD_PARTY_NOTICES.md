# Third-Party Notices

Kanvaz is built with [Electron](https://www.electronjs.org/), distributed
under the MIT License by the OpenJS Foundation. Electron itself bundles
Chromium, Node.js, and V8, each under their own open-source licenses
(primarily BSD and MIT).

When Kanvaz is built into an installer or portable app (via
electron-builder), Electron's own license files — including
`LICENSE` and `LICENSES.chromium.html` — are automatically included
in the application's installation directory. These files contain the
full text and attribution for every third-party component bundled
inside the Electron runtime.

Kanvaz's own source code (everything in `src/`, `docs/`, and this
repository) is © Atharva Patil / Northbyte Studios, licensed under the
MIT License — see [LICENSE](LICENSE).

Build tooling (`electron-builder` and its dependencies) is used only to
produce the installers and is not included in the shipped application.
