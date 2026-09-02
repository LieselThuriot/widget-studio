# Repository Instructions

## Structure

- This is an Angular 22 workspace with three projects: the editor app is `src/`, the reusable `widget-renderer` library is `projects/widget-renderer/`, and the reusable `widget-landscape` library is `projects/widget-landscape/`.
- The C# `WidgetStudio.Contracts` package and compatibility tests are under `projects/widget-contracts/`; its solution is `projects/widget-contracts/WidgetStudio.slnx`.
- Library entrypoints are `projects/widget-renderer/src/public-api.ts` and `projects/widget-landscape/src/public-api.ts`. Add every consumer-facing export there and import package APIs through those entrypoints, not internal files.
- The editor resolves both libraries through TypeScript path aliases in `tsconfig.json`, so an app build does not verify the packaged libraries.

## Commands

- Use the committed npm lockfile with npm 12.0.2: `npm ci`.
- Start the editor with `npm start` and open `http://localhost:4200/`.
- For TypeScript, template, or CSS changes, run `npm run format`, `npm run lint`, and `npm test -- --watch=false`; use `npm run format:check` when formatting must not rewrite files.
- Use `npm run build:app` for the editor, `npm run build:renderer` for `widget-renderer`, `npm run build:landscape` for an already-built renderer plus `widget-landscape`, `npm run build:libraries` for both libraries, and `npm run build` for all three projects in dependency order: renderer, landscape, then editor. The editor uses source path aliases; `widget-landscape` consumes the built renderer declarations.
- For `widget-renderer` package changes, run `npm run verify:renderer-package` after the library build. It packs `dist/widget-renderer`, installs it into a temporary consumer, and checks the public validation/normalization API.
- For C# contract or contract-test changes, run `dotnet test projects/widget-contracts/WidgetStudio.slnx` and `dotnet pack projects/widget-contracts/widget-contracts/WidgetStudio.Contracts.csproj`.

## Contracts

- The renderer accepts public `WidgetContract` data without editor-only element IDs; the editor's internal `Widget` model does use IDs. Do not make renderer consumers hydrate editor data.
- Changes to the TypeScript renderer contract must be mirrored in `projects/widget-contracts/` and its tests. C# payloads must use `WidgetJsonContext`; default `JsonSerializerOptions` do not produce the renderer wire format.
- `widget-renderer` emits refresh and button-action events. It must not perform application-specific network requests.
- Incoming renderer data should be validated with its exported helpers; invalid renderer input is intentionally handled as a safe empty widget and exposes validation issues.

## Implementation Notes

- Follow the existing standalone Angular/signal patterns and keep the strict compiler settings in `tsconfig.json`; do not add `standalone: true`.
- Angular ESLint includes template accessibility rules. Preserve focus behavior, accessible chart summaries, loading behavior, and sensitive-content behavior when changing renderer or editor UI.
- ECharts is a `widget-renderer` peer dependency. Tests load `src/test-setup.ts`, which stubs `HTMLCanvasElement.getContext` because ECharts probes canvas even for SVG charts.
- Editor shared tokens live in `src/styles/`; renderer and landscape styles must remain package-owned and must not depend on editor tokens. Preserve the editor's explicit light/dark theme support.
