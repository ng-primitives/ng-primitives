# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Install dependencies:** `pnpm install`
- **Start documentation site:** `pnpm start` (serves at http://localhost:4200)
- **Preview reusable components:** `nx serve components`
- **Build all packages/apps:** `pnpm build`
- **Run all tests:** `pnpm test`
- **Lint all projects:** `pnpm lint`
- **Run single test:** `nx test <project-name>`
- **Build specific project:** `nx build <project-name>`

## Project Architecture

This is an Nx monorepo for Angular Primitives, a headless UI library focused on accessibility and customization.

### Key Packages

- `packages/ng-primitives/` - Main primitives library with secondary entry points for each primitive (button, accordion, etc.)
- `packages/state/` - State management utilities
- `packages/tools/` - Custom Nx generators and build tools
- `apps/documentation/` - Documentation site built with AnalogJS
- `apps/components/` - Preview site for reusable components

### Project Structure

- Each primitive is a standalone Angular module under `packages/ng-primitives/<primitive>/`
- Documentation examples are in `apps/documentation/src/app/examples/`
- Reusable component examples are in `apps/components/src/app/`
- Custom generators are available for scaffolding new primitives and components

### Key Technologies

- Angular 19+, Nx 21+, pnpm package manager
- AnalogJS for documentation site (Vite-based SSG/SSR)
- Vitest for browser and node testing
- ESLint for linting, Prettier for formatting

## Nx Generators

**Always scaffold with the generators below before writing code by hand.** They
are deterministic and produce the correct file layout, the `createPrimitive`
state pattern, barrel exports, entry-point wiring, and naming. Hand-writing a
directive or a `-state.ts` from scratch is how conventions drift (e.g. inlining
host bindings in the directive instead of the state factory). Generate first,
then fill in the behaviour.

Collection: `@ng-primitives/tools`. Run with `nx g @ng-primitives/tools:<gen>`
(or the Nx Console UI). Pass `--dry-run` first to preview the file list.

| Generator            | Command                                                                  | Produces                                                                                  |
| -------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `primitive`          | `nx g ...:primitive <name>`                                              | New secondary entry point (`packages/ng-primitives/<name>/`), `index.ts`, tsconfig wiring |
| `directive`          | `nx g ...:directive <name> <primitive>`                                  | A directive **and its `-state.ts`** (`addState` defaults **true**); flags below           |
| `state`              | `nx g ...:state <directive> <primitive>`                                 | A `-state.ts` (`createPrimitive` factory) for an existing directive                       |
| `config`             | `nx g ...:config <primitive>`                                            | A global config provider (`provideXConfig`/`injectXConfig`)                               |
| `token`              | `nx g ...:token <directive> <primitive>`                                 | An injection token for a directive                                                        |
| `example`            | `nx g ...:example <directive> <primitive>`                               | A docs example (`.example.ts` + `.tailwind.example.ts`)                                   |
| `documentation`      | `nx g ...:documentation <name> --primitive <p> --section Primitives ...` | A docs page under `apps/documentation`                                                    |
| `reusable-component` | `nx g ...:reusable-component <name>`                                     | A reusable component under `apps/components` (drives the `docs-snippet`)                  |

`directive` is the workhorse - it composes the others via flags:
`--addState` (default true), `--addToken`, `--addConfig`, `--addExample`,
`--reusableComponent`, `--documentation <section>`.

**Workflow for a new primitive** with a root directive and extra parts (the
second arg to `directive` is the entry point / `--primitive`):

```bash
# 1. create the secondary entry point
nx g @ng-primitives/tools:primitive <name>
# 2. scaffold each part directive — each gets its -state.ts automatically
nx g @ng-primitives/tools:directive <name> <name> --addConfig --addExample --documentation Primitives
nx g @ng-primitives/tools:directive <name>-trigger <name>
# 3. optional reusable component (drives the docs snippet)
nx g @ng-primitives/tools:reusable-component <name>
```

Each part directive gets its `-state.ts` automatically - never scaffold those by
hand. See `.claude/rules/state-management.md` for what the generated state should
contain.

## Coding Conventions

See `.claude/rules/` for detailed coding standards:

- `angular-patterns.md` - Signal-based APIs, readonly signals, computed/effects
- `comments.md` - Let the code explain itself; comment the why, concisely
- `naming-conventions.md` - Selector prefixes, class names, file names
- `state-management.md` - The `createPrimitive` state pattern: one `-state.ts` per part, host bindings inside the factory, thin directives, controlled state, state composition
- `docs-example-styling.md` - Styling the documentation examples: brand red reserved for state, blue for focus, typography/radii scale, CSS + Tailwind parity

For code review, use the `ngp-code-review` skill — it consolidates these rules with the custom workspace lint rules, test conventions, and PR checklist.

## Package Management

- Uses pnpm with workspace configuration
- Volta specifies Node 22.15.0
- Build targets are configured in individual `project.json` files
- Dependencies are managed at the root level

## Pull Requests

When creating a pull request, follow the template at `.github/PULL_REQUEST_TEMPLATE.md`. Fill in the PR Checklist, PR Type, linked issue (`Closes #...`), description of what the PR does, and the breaking-change disclosure. Don't omit sections.

## Release Process

- Follows Conventional Commits for automated changelog generation
- Release projects: `ng-primitives` and `state`
- Use `pnpm release:version` and `pnpm release:publish` commands

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
