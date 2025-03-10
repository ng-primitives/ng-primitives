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

The `NgpSearch` directive is a container for the search field components.

- Selector: `[ngpSearch]`
- Exported As: `ngpSearch`

#### Data Attributes

| Attribute    | Description                      |
| ------------ | -------------------------------- |
| `data-empty` | Applied when the input is empty. |

### NgpSearchClear

The `NgpSearchClear` directive is can be added to a button to clear the search field on click.

- Selector: `[ngpSearchClear]`
- Exported As: `ngpSearchClear`

| Attribute    | Description                             |
| ------------ | --------------------------------------- |
| `data-empty` | Applied when the search field is empty. |

## Accessibility

Adheres to the [Search WAI-ARIA design pattern](https://www.w3.org/TR/wai-aria-1.2/#searchbox).

### Keyboard Interaction

- <kbd>Esc</kbd> - Clears the search field.
