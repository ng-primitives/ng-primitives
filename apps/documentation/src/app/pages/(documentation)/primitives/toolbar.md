---
name: 'Toolbar'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/main/packages/ng-primitives/toolbar'
---

# Toolbar

The Toolbar primitive is a container for grouping related controls.

<docs-example name="toolbar"></docs-example>

## Import

Import the Toolbar primitives from `ng-primitives/toolbar`.

```ts
import { NgpToolbar } from 'ng-primitives/toolbar';
```

## Usage

Assemble the toolbar directives in your template.

```html
<div ngpToolbar>
  <!-- Toolbar content -->
</div>
```

## Reusable Component

Create a reusable component that uses the `NgpToolbar` directive.

<docs-snippet name="toolbar"></docs-snippet>

## Schematics

Generate a reusable toolbar component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive toolbar
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/toolbar` package:

### NgpToolbar

<api-docs name="NgpToolbar"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpToolbar` directive:

| Attribute          | Description                     | Value                      |
| ------------------ | ------------------------------- | -------------------------- |
| `data-orientation` | The orientation of the toolbar. | `horizontal` \| `vertical` |

## Accessibility

Adheres to the [WAI-ARIA Toolbar Design Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/toolbar).

### Keyboard Interaction

- <kbd>Tab</kbd> - Moves focus to the first interactive element in the toolbar.
- <kbd>Arrow Down</kbd> - Moves focus to the next interactive element (vertical orientation).
- <kbd>Arrow Up</kbd> - Moves focus to the previous interactive element (vertical orientation).
- <kbd>Arrow Right</kbd> - Moves focus to the next interactive element (horizontal orientation).
- <kbd>Arrow Left</kbd> - Moves focus to the previous interactive element (horizontal orientation).
- <kbd>Home</kbd> - Moves focus to the first interactive element in the toolbar.
- <kbd>End</kbd> - Moves focus to the last interactive element in the toolbar.
