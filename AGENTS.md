# Repository Instructions

## Structure

- This is an Angular 22 workspace with two Angular projects: `widget` is the editor application under `src/`; `widget-renderer` is the reusable library under `projects/widget-renderer/`. The C# `WidgetStudio.Contracts` package and its tests live under `projects/widget-contracts/`.
- The library entrypoint is `projects/widget-renderer/src/public-api.ts`. Keep public exports there in sync with any new consumer-facing API.
- The widget-renderer contract is mirrored by the C# NuGet package under `projects/widget-contracts/`; changes to renderer contracts must also be made in the C# package and its tests.
- The editor imports the library through the `widget-renderer` TypeScript path alias; application changes do not by themselves prove the packaged library works.

## Commands

- Use npm with the committed `package-lock.json` (`npm@12.0.2` is declared in `package.json`); use `npm ci` for a clean install.
- Start the editor with `npm start` and open `http://localhost:4200/`.
- For TypeScript-side changes, including Angular templates, CSS, or other npm-side application/library code, run `npm run format`, `npm run lint`, and `npm test -- --watch=false`. Check formatting with `npm run format:check` when you do not want to rewrite files. These checks are not required for documentation-only or C#-only changes.
- `npm run build` builds both the application and library. Use `npm run build:app` or `npm run build:library` for one project.
- For library-facing changes, run `npm run verify:library-package`. It builds the library, packs `dist/widget-renderer`, installs it into a temporary consumer, and runs a packaged-consumer smoke test for selected public APIs.
- When changing C# contracts or C# contract tests, run `dotnet test projects/widget-contracts/WidgetStudio.slnx` and `dotnet pack projects/widget-contracts/widget-contracts/WidgetStudio.Contracts.csproj`. These commands are not required for TypeScript-only changes.

## Conventions

- Keep the TypeScript compiler and Angular strictness options configured in `tsconfig.json` intact; prefer inferred types and avoid `any` when `unknown` or a specific type is possible.
- Reuse existing components, classes, design tokens, and interaction patterns before creating new UI styles or controls. New UI must be fully styled, including form controls, buttons, focus states, responsive behavior, and light/dark themes.
- Use the existing Angular patterns: standalone components, signals for local state, `inject()`, signal/input/output APIs, external colocated HTML/CSS, and native `@if`/`@for`/`@switch` control flow.
- Do not add `standalone: true`; standalone components are the workspace default. Add an explicit `OnPush` change-detection strategy only when it is an intentional choice supported by the component's behavior and existing patterns.
- Put host event bindings in a component or directive decorator's `host` object instead of using `@HostBinding` or `@HostListener`.
- Use `NgOptimizedImage` for static images; it does not support inline base64 images.
- Use `computed()` for derived signal state and update signals with `set()` or `update()` rather than mutation.
- Preserve accessibility behavior. Angular ESLint includes template accessibility rules, and the test suite covers renderer behavior such as focus, hydration, validation, chart accessibility, loading, and sensitive content.
- The editor uses `Widget` internal models with IDs; normal library/API consumers use `WidgetContract` without IDs. Do not require callers to hydrate API data before rendering.
- Renderer button actions and refresh events are emitted to the consuming application; the library must not make those network requests itself.
- ECharts is a peer dependency of `widget-renderer`; chart tests use `src/test-setup.ts` because ECharts probes canvas support even when charts render as SVG.
- Preserve dark-mode support for every new editor, dialog, button, form control, and visual preview. Add `:host-context(html[data-theme='dark'])` styles and verify both light and dark themes when changing UI.

### CSS

- Use plain modern CSS. Do not migrate stylesheets to SCSS or add PostCSS without an explicit decision.
- Define shared editor design tokens in `src/styles/` and keep them semantic. Do not import editor styles or tokens into `widget-renderer`.
- Keep component styles colocated and compatible with Angular emulated encapsulation. Do not use native CSS nesting in Angular component styles; Angular 22 disables nesting for these stylesheets.
- Prefer CSS custom properties, `:is()`, logical properties, `min()`, `max()`, and `calc()` when they provide clear value without changing behavior.
- Use `@supports`, `color-mix()`, container queries, `light-dark()`, and other newer features only with a concrete use case and an appropriate fallback. Do not add `@layer` casually because it changes cascade precedence.
- Preserve explicit `html[data-theme='light'|'dark']` behavior and the existing `:host-context(html[data-theme='dark'])` support. Verify theme transitions and both themes after CSS changes.
- Avoid `::ng-deep`. For editor integration with renderer internals, use an explicit host-level contract or namespaced CSS custom properties instead.
- Keep renderer CSS independently styled and defaulted for external consumers. Run `npm run build:library` and `npm run verify:library-package` for renderer-facing style changes.
