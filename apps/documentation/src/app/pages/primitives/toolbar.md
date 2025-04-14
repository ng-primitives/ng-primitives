---
name: 'Toolbar'
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
