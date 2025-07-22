---
name: 'Radio'
---

# Radio

Selection within a group.

<docs-example name="radio"></docs-example>

## Import

Import the Radio primitives from `ng-primitives/radio`.

```ts
import { NgpRadioGroup, NgpRadioItem, NgpRadioIndicator } from 'ng-primitives/radio';
```

## Usage

Assemble the radio directives in your template.

```html
<div ngpRadioGroup [(ngpRadioGroupValue)]="value">
  <button ngpRadioItem ngpRadioItemValue="Option 1">
    <ng-icon ngpRadioIndicator name="dot" />
    Option 1
  </button>

  <button ngpRadioItem ngpRadioItemValue="Option 2">
    <ng-icon ngpRadioIndicator name="dot" />
    Option 2
  </button>

  <button ngpRadioItem ngpRadioItemValue="Option 3">
    <ng-icon ngpRadioIndicator name="dot" />
    Option 3
  </button>
</div>
```

## Reusable Component

Create a reusable component that uses the radio directives.

<docs-snippet name="radio"></docs-snippet>

## Schematics

Generate a reusable radio component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive radio
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/radio` package:

### NgpRadioGroup

<api-docs name="NgpRadioGroup"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpRadioGroup` directive:

| Attribute          | Description                               | Value                      |
| ------------------ | ----------------------------------------- | -------------------------- |
| `data-orientation` | The orientation of the radio group.       | `vertical` \| `horizontal` |
| `data-disabled`    | Applied when the radio group is disabled. | `-`                        |

### NgpRadioItem

<api-docs name="NgpRadioItem"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpRadioItem` directive:

| Attribute            | Description                              |
| -------------------- | ---------------------------------------- |
| `data-checked`       | Applied when the radio item is checked.  |
| `data-disabled`      | Applied when the radio item is disabled. |
| `data-hover`         | Applied when the radio item is hovered.  |
| `data-focus-visible` | Applied when the radio item is focused.  |
| `data-press`         | Applied when the radio item is pressed.  |

### NgpRadioIndicator

<api-docs name="NgpRadioIndicator"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpRadioItem` directive:

| Attribute       | Description                              |
| --------------- | ---------------------------------------- |
| `data-checked`  | Applied when the radio item is checked.  |
| `data-disabled` | Applied when the radio item is disabled. |
| `data-hover`    | Applied when the radio item is hovered.  |
| `data-press`    | Applied when the radio item is pressed.  |

## Accessibility

Adheres to the [Radio Group WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio).

### Keyboard Interaction

- <kbd>Tab</kbd> - Moves focus to the first radio button.
- <kbd>Arrow Down</kbd> - Moves focus to the next radio button (vertical orientation).
- <kbd>Arrow Up</kbd> - Moves focus to the previous radio button (vertical orientation).
- <kbd>Arrow Right</kbd> - Moves focus to the next radio button (horizontal orientation).
- <kbd>Arrow Left</kbd> - Moves focus to the previous radio button (horizontal orientation).
- <kbd>Space</kbd> - Selects the focused radio button if not already selected.
