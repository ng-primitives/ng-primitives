# Drawer state migration design

## Goal

Replace the drawer's local `createSharedState` abstraction with the repository's
`createPrimitive` API from `ng-primitives/state`.

## Design

The three internal drawer state modules will keep their pure state factories and
use `createPrimitive` to expose the DI integration:

- a state token;
- an initialization factory;
- an injection helper;
- a provider helper.

All drawer directives will consume these helpers directly. Root providers remain
isolated with `{ inherit: false }`, while optional and `skipSelf` injection options
retain their current behavior.

The local `om-create-shared-state.ts` helper will be deleted. No compatibility
wrapper or new public API will be introduced.

## Behavior and lifecycle

State construction, nested drawer registration, provider aggregation, virtual
keyboard synchronization, cleanup callbacks, and destroy handling remain
unchanged. The migration only replaces the DI-backed state transport.

## Validation

Run formatting checks, the drawer's relevant tests, and the Nx build target for
the `ng-primitives` project. Fix any type, injection, or lifecycle regression
found by those checks.

## Test integration and regression diagnosis

The ported drawer tests use `*.spec.ts`, while this repository discovers and
compiles `*.test.ts`. Rename every drawer test to the repository convention.
Keep DOM-independent tests in the existing browser-test target and run tests
that require native browser layout or event APIs through an explicit Playwright
browser configuration using `*.browser.test.ts`.

Reproduce failing files individually before changing behavior. Classify each
failure as test interference, runner integration, or an implementation
regression. Preserve the original behavioral expectations: improve cleanup or
synchronization when the runner differs, and change drawer implementation only
when an actual regression is demonstrated. Finally, run the complete drawer
suite through the standard Nx browser-test target.

## Ngp naming migration

Migrate the drawer completely from its original `Om`/`om` namespace to the
repository's `Ngp`/`ngp` conventions without compatibility aliases.

- Rename selectors, existing `exportAs` values, public classes, types, events,
  constants, factories, input aliases, state descriptors, IDs, messages, and
  owned DOM attributes.
- Remove the `Directive` suffix from public directive classes and rename their
  source files from `*.directive.ts` to `*.ts`, matching comparable primitives.
- Namespace owned CSS custom properties as `--ngp-drawer-*`.
- Preserve neutral state attributes such as `data-open`, test-only
  `data-test-*` attributes, and the intentional `data-base-ui-swipe-ignore`
  compatibility hook.
- Update every unit and browser test to the new public API and DOM contracts.
- Replace `model()` bindings with paired inputs/outputs backed by writable
  `linkedSignal` state, preserving template bindings and imperative state while
  satisfying the repository lint rules.
- Register `ng-primitives/drawer` as a secondary package entrypoint so the Nx
  production build compiles and publishes the migrated API.

The migration is intentionally breaking. Production and test changes may be
implemented independently, followed by a central code review and full lint,
build, unit-test, and native-browser-test validation.
