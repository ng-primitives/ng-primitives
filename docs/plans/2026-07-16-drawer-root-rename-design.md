# Drawer Root Rename Design

## Goal

Rename the drawer root primitive from `ngpDrawerRoot` / `NgpDrawerRoot` to
`ngpDrawer` / `NgpDrawer` across the complete workspace.

## Scope

- Rename the public Angular selector and `exportAs` value.
- Rename the exported directive class.
- Rename the directive source file and its directory where appropriate.
- Rename root-specific test files and update all test references.
- Update public exports, internal messages and comments.
- Update documentation and examples.

## Compatibility

This is an intentionally breaking, atomic rename. The previous selector, class,
export name, filenames, and documentation references will be removed without
deprecated aliases.

## Validation

- Search the workspace to ensure no `ngpDrawerRoot`, `NgpDrawerRoot`, or
  `drawer-root` references remain in the affected implementation.
- Run the relevant Nx tests and build targets for the affected projects.
