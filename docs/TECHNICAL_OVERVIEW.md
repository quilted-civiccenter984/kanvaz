# Technical Overview

This document describes how Kanvaz is built, for anyone reading the
source, considering a contribution, or just curious how it works.

## Stack
- **Electron 22.3.27** (locked — see "Why pinned versions" below)
- **electron-builder 24.13.3** for packaging installers
- Plain JavaScript (ES5-style `var`, no build step, no bundler, no
  frontend framework) — the entire UI is hand-written HTML/CSS/JS
- No runtime dependencies. The only `devDependencies` are Electron and
  electron-builder themselves.

## Why pinned versions
Electron and electron-builder are intentionally pinned and not meant to
be upgraded. The app was built and tested against these exact versions.
Newer major versions of Electron can introduce breaking changes (security
defaults, Node integration changes, etc.) that would require a re-audit
of the whole app. Since development has concluded, the pin avoids
"working build today, broken build after `npm install` next year."

## Module map (`src/`)

| File | Responsibility |
|---|---|
| `main.js` | Electron main process — window management, all IPC handlers (file read/write, dialogs, recovery, recent files, media loading with size/type checks), close-with-unsaved-changes interception |
| `preload.js` | `contextBridge` API exposed to the renderer as `window.KanvazBridge` — only whitelisted IPC channels are exposed |
| `media.js` | Media type detection (image/GIF/video/audio), natural-size probing, drop-size capping |
| `canvas.js` | Pan/zoom, dot-grid background, screen↔world coordinate conversion, drag-and-drop entry point |
| `cards.js` | Card data model and rendering. Uses event delegation — 3 listeners attached once to the canvas, never re-bound, so they keep working across board switches. Builds each card type (image/GIF/video/audio/note) and wires up resize handles, pin, duplicate, delete, etc. |
| `history.js` | Undo/redo stack (50 steps). Snapshots share immutable fields (media data, dimensions, type, id) by reference and only deep-copy mutable fields (position, size, rotation) — keeps memory bounded even with large media |
| `annotate.js` | Per-card canvas overlay for pen/arrow/rectangle annotations in 6 colors |
| `boards.js` | Multi-board state — create/rename/delete/switch tabs, save/load `.kanvaz` files, serialization, recovery autosave, startup screen |
| `shortcuts.js` | Global keyboard shortcut handling. Care is taken around: (1) not firing shortcuts while typing in a text field, (2) ignoring OS key-repeat for one-shot actions like duplicate/pin/save while still allowing continuous arrow-key nudging |
| `ui.js` | Settings, About, and shortcuts-reference panels; persists user settings |
| `app.js` | Two separate modules in one file: the outer `KanvazApp` (window chrome, dirty/save-state tracking) and a nested `KanvazUI` (toasts, dialogs, context menus, "mood lock" presentation mode) |
| `errors.js` | Centralized error-code → user-facing message mapping |

## File format
`.kanvaz` files are plain JSON. All media (images, video, audio) is
embedded as base64 data URLs inside the JSON — the file is fully
self-contained and portable, at the cost of larger file sizes for
media-heavy boards.

## Design conventions
- **Dark theme only**, fixed color palette (see CSS custom properties at
  the top of `main.css`) — canvas, chrome, surface, accent (blue), amber,
  red, green, and three text tones with a defined minimum-contrast
  "floor" for the dimmest text.
- **`var` only** — no `const`/`let`/arrow functions/`.forEach()`. This was
  a deliberate consistency choice throughout the codebase, not a
  limitation of the JS engine (Electron 22 supports modern JS fine).
- **No native `MessageBox`/`confirm()`/`alert()`** — all dialogs are
  custom-styled to match the app's theme.

## Known limitations
See the "Known limitations" section in [README.md](README.md) — these
are intentional, stable design decisions, not bugs.

## Building from source
```bash
npm install
npm start          # run in development
npm run build:win  # produce Windows installer + portable exe
```
