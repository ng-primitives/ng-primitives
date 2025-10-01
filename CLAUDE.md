# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- **Install dependencies:** `pnpm install`
- **Start documentation site:** `pnpm start` (serves at http://localhost:4200)
- **Preview reusable components:** `nx serve components`
- **Build all packages/apps:** `pnpm build`
- **Run all tests:** `pnpm test`
- **Lint all projects:** `pnpm lint`
- **E2E tests:** `pnpm e2e` (runs Playwright tests)
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
- `apps/components-e2e/` - Playwright E2E tests

### Project Structure

- Each primitive is a standalone Angular module under `packages/ng-primitives/<primitive>/`
- Documentation examples are in `apps/documentation/src/app/examples/`
- Reusable component examples are in `apps/components/src/app/`
- Custom generators are available for scaffolding new primitives and components

### Key Technologies

- Angular 19+, Nx 21+, pnpm package manager
- AnalogJS for documentation site (Vite-based SSG/SSR)
- Jest for unit testing, Playwright for E2E testing
- ESLint for linting, Prettier for formatting

## Nx Generators

Use these generators to scaffold new code:

- `nx g @ng-primitives/tools:primitive <name>` - New primitive secondary entry point
- `nx g @ng-primitives/tools:reusable-component <name>` - New reusable component
- `nx g @ng-primitives/tools:example <name> --primitive <primitive>` - New example

Prefer using Nx Console UI in your IDE for running generators.

## Coding Conventions

### Naming

- Selectors: `ngp` prefix (e.g., `ngpButton`)
- Class names: `Ngp` prefix, PascalCase, no suffixes (e.g., `NgpButton`, not `NgpButtonDirective`)
- File names: kebab-case, omit `.directive` for directives (e.g., `button.ts`)

### Angular Patterns

- Use signal inputs and `output()` function for outputs
- Avoid `model()` - prefer explicit input/output pairs
- Follow existing patterns in the primitives for consistency

## Package Management

- Uses pnpm with workspace configuration
- Volta specifies Node 22.15.0
- Build targets are configured in individual `project.json` files
- Dependencies are managed at the root level

## Release Process

- Follows Conventional Commits for automated changelog generation
- Release projects: `ng-primitives` and `state`
- Use `pnpm release:version` and `pnpm release:publish` commands
