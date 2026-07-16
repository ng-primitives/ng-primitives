# Drawer documentation design

## Goal

Integrate the eleven drawer demos supplied from the original repository into
the ng-primitives documentation application. The examples must teach the
drawer API using the conventions, visual language, and source-view experience
already used by this repository.

## Example architecture

Create eleven independent, executable examples under
`apps/documentation/src/app/examples/drawer/`:

- `drawer.example.ts`, adapted from the hero demo;
- `drawer-close-confirmation.example.ts`;
- `drawer-indent-provider.example.ts`;
- `drawer-mobile-nav.example.ts`;
- `drawer-nested.example.ts`;
- `drawer-non-modal.example.ts`;
- `drawer-position.example.ts`;
- `drawer-snap-points.example.ts`;
- `drawer-swipe-area.example.ts`;
- `drawer-uncontained.example.ts`;
- `drawer-virtual-keyboard-aware.example.ts`.

Each example will be a standalone default-exported Angular component with an
inline template and inline standard CSS. No Tailwind variants will be added in
this iteration. Styles will use the documentation theme's `--ngp-*` tokens,
drawer-owned CSS variables, and drawer state attributes instead of the source
demos' utility classes.

The source directory `packages/ng-primitives/drawer/demos/` is temporary input
and will be removed after every scenario has been represented in the
documentation application.

## Documentation page

Add `apps/documentation/src/app/pages/(documentation)/primitives/drawer.md`.
The page will include:

- a primary runnable example;
- package imports and basic composition;
- focused sections for position, snap points, nested drawers, non-modal usage,
  custom portal containers, edge swipe areas, close confirmation, indentation,
  mobile navigation, uncontained action sheets, and virtual-keyboard handling;
- API references for every exported drawer directive, public event/type, and
  handle factory where supported by the documentation components;
- owned data attributes and CSS custom properties;
- accessibility and keyboard/gesture guidance.

Add Drawer to the generated documentation category for overlays and dialogs.

## Behavioral preservation

The examples will use the migrated `NgpDrawer*` API from
`ng-primitives/drawer`. They will preserve the purpose of the source scenarios
without preserving One-Medisyn names, selectors, shared demo imports, or visual
styling. Dismiss guards, controlled bindings, nested relationships, portal
containers, snap points, and virtual-keyboard behavior must remain functional.

## Validation

Run formatting, the documentation lint target, the ng-primitives lint target,
and production builds for both `ng-primitives` and `documentation`. Inspect the
rendered documentation in a browser when practical, especially fixed overlays,
contained portals, nested drawers, and mobile-sized layouts.
