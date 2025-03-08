---
name: 'Listbox'
---

# Listbox

A listbox presents a set of choices and lets users select one or multiple options. It can be paired with the `NgpPopover` directive to create a dropdown listbox.

<docs-example name="listbox"></docs-example>

## Import

Import the Listbox primitives from `ng-primitives/listbox`.

```ts
import { NgpListbox } from 'ng-primitives/listbox';
```

## Usage

Assemble the listbox directives in your template.

```html
<div ngpListbox>
  <div ngpListboxOption value="1">Option 1</div>
  <div ngpListboxOption value="2">Option 2</div>
  <div ngpListboxOption value="3">Option 3</div>
</div>
```

## Examples

### Multi-Select Listbox

The listbox can be configured to allow multiple selections.

<docs-example name="listbox-multiple"></docs-example>

### Listbox with Sections

The listbox can be configured to have sections and headers.

<docs-example name="listbox-sections"></docs-example>

### Select Listbox

The listbox can be configured to act as a select dropdown.

<docs-example name="listbox-select"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/listbox` package:

### NgpListbox

- Selector: `[ngpListbox]`
- Exported As: `ngpListbox`

<response-field name="ngpListboxMode" type="single | multiple" default="single">
  The selection mode of the listbox. Can be either `single` or `multiple`.
</response-field>

<response-field name="ngpListboxValue" type="string[]" default="[]">
  The selected value(s) of the listbox.
</response-field>

<response-field name="ngpListboxDisabled" type="boolean" default="false">
  Whether the listbox is disabled.
</response-field>

<response-field name="ngpListboxCompareWith" type="(a: T, b: T) => boolean">
  A function to compare two values of the listbox. The function should return `true` if the values are equal. This is useful when the listbox options are objects.
</response-field>

### NgpListboxOption

- Selector: `[ngpListboxOption]`
- Exported As: `ngpListboxOption`

<response-field name="ngpListboxOption" type="T">
  The value of the option.
</response-field>

<response-field name="ngpListboxOptionDisabled" type="boolean" default="false">
  Whether the option is disabled.
</response-field>

### NgpListboxSection

- Selector: `[ngpListboxSection]`
- Exported As: `ngpListboxSection`

### NgpListboxTrigger

- Selector: `[ngpListboxTrigger]`
- Exported As: `ngpListboxTrigger`

Augments the popover trigger with listbox-specific behavior, such as opening the listbox when the arrow keys are pressed.

#### Data Attributes

The following data attributes are applied to the `ngpListbox` directive:

| Attribute            | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `data-focus-visible` | Applied to the listbox when focused via the keyboard. |

The following data attributes are applied to the `ngpListboxOption` directive:

| Attribute            | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| `data-hover`         | Applied to the listbox option when hovered.                     |
| `data-focus`         | Applied to the listbox option when focused.                     |
| `data-focus-visible` | Applied to the listbox option when focused via the keyboard.    |
| `data-disabled`      | Applied to the listbox option when disabled.                    |
| `data-active`        | Applied to the listbox option when it is the active descendant. |
| `data-disabled`      | Applied to the listbox option when it is disabled.              |
| `data-selected`      | Applied to the listbox option when it is selected.              |

## Accessibility

Adheres to the [WAI-ARIA Listbox Design Pattern](https://www.w3.org/TR/wai-aria-practices-1.1/#Listbox).

### Keyboard Interactions

- <kbd>Arrow Down</kbd> - Move focus to the next option.
- <kbd>Arrow Up</kbd> - Move focus to the previous option.
- <kbd>Home</kbd> - Move focus to the first option.
- <kbd>End</kbd> - Move focus to the last option.
- <kbd>Space</kbd> - Select the focused option.
- <kbd>Enter</kbd> - Select the focused option.
- <kbd>Escape</kbd> - Close the listbox.
