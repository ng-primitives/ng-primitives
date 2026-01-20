---
name: 'Listbox'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/main/packages/ng-primitives/listbox'
---

# Listbox

A listbox presents a set of choices and lets users select one or multiple options.

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
  <div ngpListboxOption ngpListboxOptionValue="1">Option 1</div>
  <div ngpListboxOption ngpListboxOptionValue="2">Option 2</div>
  <div ngpListboxOption ngpListboxOptionValue="3">Option 3</div>
</div>
```

## Reusable Component

Create a reusable component that uses the listbox directives.

<docs-snippet name="listbox"></docs-snippet>

## Schematics

Generate a reusable listbox component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive listbox
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

### Multi-Select Listbox

The listbox can be configured to allow multiple selections.

<docs-example name="listbox-multiple"></docs-example>

### Listbox with Sections

The listbox can be configured to have sections and headers.

<docs-example name="listbox-sections"></docs-example>

### Listbox with popover

The listbox can be paired with the `NgpPopover` directive to create a dropdown listbox.

<docs-example name="listbox-select"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/listbox` package:

### NgpListbox

<api-docs name="NgpListbox"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpListbox` directive:

| Attribute            | Description                                           |
| -------------------- | ----------------------------------------------------- |
| `data-focus-visible` | Applied to the listbox when focused via the keyboard. |

### NgpListboxOption

<api-docs name="NgpListboxOption"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpListboxOption` directive:

| Attribute            | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| `data-hover`         | Applied to the listbox option when hovered.                     |
| `data-focus`         | Applied to the listbox option when focused.                     |
| `data-focus-visible` | Applied to the listbox option when focused via the keyboard.    |
| `data-active`        | Applied to the listbox option when it is the active descendant. |
| `data-disabled`      | Applied to the listbox option when it is disabled.              |
| `data-selected`      | Applied to the listbox option when it is selected.              |

### NgpListboxSection

<api-docs name="NgpListboxSection"></api-docs>

### NgpListboxTrigger

<api-docs name="NgpListboxTrigger"></api-docs>

Augments the popover trigger with listbox-specific behavior, such as opening the listbox when the arrow keys are pressed.

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
