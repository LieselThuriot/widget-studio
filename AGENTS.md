# Repository Instructions

## Structure

- This is an Angular 22 workspace with two projects: `widget` is the editor application under `src/`; `widget-renderer` is the reusable library under `projects/widget-renderer/`.
- The library entrypoint is `projects/widget-renderer/src/public-api.ts`. Keep public exports there in sync with any new consumer-facing API.
- The editor imports the library through the `widget-renderer` TypeScript path alias; application changes do not by themselves prove the packaged library works.

## Commands

- Use npm with the committed `package-lock.json` (`npm@12.0.2` is declared in `package.json`); use `npm ci` for a clean install.
- Start the editor with `npm start` and open `http://localhost:4200/`.
- Run formatting after edits with `npm run format`; check it with `npm run format:check`.
- Run lint with `npm run lint` and non-watch unit tests with `npm test -- --watch=false`.
- `npm run build` builds both the application and library. Use `npm run build:app` or `npm run build:library` for one project.
- For library-facing changes, run `npm run verify:library-package` after the library build. It packs `dist/widget-renderer`, installs it into a temporary consumer, and verifies the public API.

## Conventions

- Keep strict TypeScript settings intact; prefer inferred types and avoid `any` when `unknown` or a specific type is possible.
- Use the existing Angular patterns: standalone components, signals for local state, `inject()`, signal/input/output APIs, external colocated HTML/CSS, and native `@if`/`@for`/`@switch` control flow.
- Do not add `standalone: true` or explicit `OnPush`; both are defaults in this Angular 22 workspace.
- Put host event bindings in a component or directive decorator's `host` object instead of using `@HostBinding` or `@HostListener`.
- Use `NgOptimizedImage` for static images; it does not support inline base64 images.
- Use `computed()` for derived signal state and update signals with `set()` or `update()` rather than mutation.
- Preserve accessibility behavior. Angular ESLint includes template accessibility rules, and the test suite covers renderer behavior such as focus, hydration, validation, chart accessibility, loading, and sensitive content.
- The editor uses `Widget` internal models with IDs; normal library/API consumers use `WidgetContract` without IDs. Do not require callers to hydrate API data before rendering.
- Renderer button actions and refresh events are emitted to the consuming application; the library must not make those network requests itself.
- ECharts is a peer dependency of `widget-renderer`; chart tests use `src/test-setup.ts` because ECharts probes canvas support even when charts render as SVG.
