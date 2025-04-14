---
name: 'Search'
---

# Search

The search primitive is a form control that allows users to enter a search query and clear the input.

<docs-example name="search"></docs-example>

## Import

Import the Search primitives from `ng-primitives/search`.

```ts
import { NgpSearch, NgpSearchClear } from 'ng-primitives/search';
```

## Usage

Assemble the search directives in your template.

```html
<div ngpFormField>
  <label ngpLabel>Label</label>
  <div ngpSearch>
    <input ngpInput type="search" />
    <button ngpSearchClear ngpButton aria-label="Clear search">Clear</button>
  </div>
</div>
```

## API Reference

The following directives are available to import from the `ng-primitives/search` package:

### NgpSearch

<api-docs name="NgpSearch"></api-docs>

#### Data Attributes

| Attribute    | Description                      |
| ------------ | -------------------------------- |
| `data-empty` | Applied when the input is empty. |

### NgpSearchClear

<api-docs name="NgpSearchClear"></api-docs>

| Attribute    | Description                             |
| ------------ | --------------------------------------- |
| `data-empty` | Applied when the search field is empty. |

## Accessibility

Adheres to the [Search WAI-ARIA design pattern](https://www.w3.org/TR/wai-aria-1.2/#searchbox).

### Keyboard Interaction

- <kbd>Esc</kbd> - Clears the search field.
