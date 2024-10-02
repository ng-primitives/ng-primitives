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

## Schematics

Generate a radio component with the `NgpRadioGroup` primitive preconfigured.

```bash npm
 ng g ng-primitives:radio
```

### Options

- `name`: The name of the component.
- `prefix`: The prefix to apply to the generated component selector.
- `directory`: The directory at which to create the component file.
- `style`: The file extension or preprocessor to use for style files.
- `inlineStyle`: Include styles inline in the component.ts file. Only CSS styles can be included inline.
- `inlineTemplate`: Include template inline in the component.ts file

## API Reference

The following directives are available to import from the `ng-primitives/radio` package:

### NgpRadioGroup

Apply the `ngpRadioGroup` directive to an element that represents the group of radio items.

- Selector: `[ngpRadioGroup]`
- Exported As: `ngpRadioGroup`
- Host Directives: [NgpRovingFocusGroup](/primitives/roving-focus), [NgpFormControl](/primitives/form-field)

<response-field name="ngpRadioGroupValue" type="string | undefined">
  Define the selected value.
</response-field>

<response-field name="ngpRadioGroupDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

<response-field name="ngpRadioGroupOrientation" type="'vertical' | 'horizontal'" default="horizontal"> Define the orientation.</response-field>

<response-field name="ngpRadioGroupValueChange" type="boolean">
  Event emitted when the selection changes.
</response-field>

### NgpRadioItem

Apply the `ngpRadioItem` directive to an element that represents a radio item. This would typically be a `button` element.

- Selector: `[ngpRadioItem]`
- Exported As: `ngpRadioItem`
- Host Directives: [NgpRovingFocusItem](/primitives/roving-focus), [NgpHover](/interactions/hover), [NgpFocusVisible](/interactions/focus-visible), [NgpPress](/interactions/press)

<response-field name="ngpRadioItemValue" type="string" required="true">
  Define the value of this item.
</response-field>

<response-field name="ngpRadioItemDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpRadioGroup` directive:

| Attribute          | Description                               | Value                      |
| ------------------ | ----------------------------------------- | -------------------------- |
| `data-orientation` | The orientation of the radio group.       | `vertical` \| `horizontal` |
| `data-disabled`    | Applied when the radio group is disabled. | `-`                        |

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

Apply the `ngpRadioIndicator` directive to an element that represents the radio indicator (i.e. the dot).

- Selector: `[ngpRadioIndicator]`
- Exported As: `ngpRadioIndicator`
- Host Directives: [NgpHover](/interactions/hover), [NgpPress](/interactions/press)

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
