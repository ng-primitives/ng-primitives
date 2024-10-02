---
name: 'Search Field'
---

# Search Field

A search field is a form control that allows users to enter a search query.

<docs-example name="search-field"></docs-example>

## Import

Import the SearchField primitives from `ng-primitives/search`.

```ts
import { NgpSearchField, NgpSearchFieldClear } from 'ng-primitives/search';
```

## Usage

Assemble the search-field directives in your template.

```html
<div ngpSearchField>
  <label ngpLabel>Label</label>
  <input ngpInput type="search" />
  <button ngpButton ngpSearchFieldClear aria-label="Clear search">Clear</button>
</div>
```

## API Reference

The following directives are available to import from the `ng-primitives/search` package:

### NgpSearchField

The `NgpSearchField` directive is a container for the search field components.

- Selector: `[ngpSearchField]`
- Exported As: `ngpSearchField`
- Host Directives: [NgpFormField](/primitives/form-field)

#### Data Attributes

| Attribute       | Description                         |
| --------------- | ----------------------------------- |
| `data-empty`    | Applied when the input is empty.    |
| `data-invalid`  | Applied when the input is invalid.  |
| `data-valid`    | Applied when the input is valid.    |
| `data-touched`  | Applied when the input is touched.  |
| `data-pristine` | Applied when the input is pristine. |
| `data-dirty`    | Applied when the input is dirty.    |
| `data-pending`  | Applied when the input is pending.  |
| `data-disabled` | Applied when the input is disabled. |

### NgpSearchFieldClear

The `NgpSearchFieldClear` directive is can be added to a button to clear the search field on click.

- Selector: `[ngpSearchFieldClear]`
- Exported As: `ngpSearchFieldClear`

| Attribute    | Description                             |
| ------------ | --------------------------------------- |
| `data-empty` | Applied when the search field is empty. |

## Accessibility

Adheres to the [Search WAI-ARIA design pattern](https://www.w3.org/TR/wai-aria-1.2/#searchbox).

### Keyboard Interaction

- <kbd>Esc</kbd> - Clears the search field.
