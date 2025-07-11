# Copilot Instructions for ng-primitives

## Project Overview
- **ng-primitives** is a headless, low-level Angular UI primitives library focused on accessibility, customization, and developer experience. It is organized as an Nx monorepo with multiple packages and apps.
- Major packages: `packages/ng-primitives` (main primitives), `packages/state` (state utilities), and `apps/documentation` (docs site). Each primitive (e.g., button, accordion) is a secondary entry point under `packages/ng-primitives`.
- The documentation and preview apps use [AnalogJS](https://analogjs.org/) and Vite for builds and dev servers.

## Key Workflows
- **Install dependencies:** `pnpm install`
- **Build all packages/apps:** `pnpm build`
- **Run all tests:** `pnpm test`
- **Lint all projects:** `pnpm lint`
- **Start documentation site:** `pnpm start` (serves docs at http://localhost:4200)
- **Preview reusable components:** `nx serve components`
- **E2E tests:** `pnpm e2e` (runs Playwright tests for `components-e2e`)

## Nx Usage
- Use Nx generators for new primitives, directives, docs, and examples. Prefer the Nx Console UI for scaffolding.
- Example: `nx g @ng-primitives/tools:primitive <name>` creates a new secondary entry point.
- Project configuration is in `project.json` files per app/package. Build/test/lint targets are defined there.
- Use `nx run <project>:<target>` for granular task execution.

## Coding Conventions
- **Selectors:** Prefix with `ngp` (e.g., `ngp-button`).
- **Class names:** Prefix with `Ngp` (e.g., `NgpButton`). Avoid suffixes like `Directive`.
- **File names:** Use kebab-case. For directives, omit `.directive` (e.g., `button.ts`).
- **Inputs/Outputs:** Use signal inputs and the `output` function for outputs. Avoid `model` patterns; prefer explicit input/output pairs.
- **Tests:** Use Jest for unit tests, Playwright for E2E.

## Integration & Structure
- Each primitive is a standalone Angular module under `packages/ng-primitives/<primitive>`.
- State utilities are in `packages/state` and can be used independently.
- Documentation and examples are in `apps/documentation` and `apps/components`.
- Custom Nx generators and executors are in `tools/`.

## External Dependencies
- Uses Angular 19+, Nx 21+, pnpm, AnalogJS, Vite, Jest, Playwright, TailwindCSS.
- See `package.json` for full dependency list.

## Contribution & Standards
- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.
- See `CONTRIBUTING.md` for detailed contribution, naming, and workflow guidelines.
- All new primitives should be accessible and customizable, following the patterns in existing primitives.

## References
- Main docs: [README.md](../../README.md)
- Contribution guide: [CONTRIBUTING.md](../../CONTRIBUTING.md)
- Example primitive: `packages/ng-primitives/button/`
- Nx config: `nx.json`, `project.json` in each package/app
- Custom generators: `tools/`

---

If any section is unclear or missing, please provide feedback to improve these instructions.
