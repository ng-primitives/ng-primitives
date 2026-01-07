---
name: 'Combobox'
---

# Combobox

The Combobox primitive is a combination of a dropdown and an input field. It allows users to select from a list of options while filtering the list based on their input.

<docs-example name="combobox"></docs-example>

## Import

Import the Combobox primitives from `ng-primitives/combobox`.

```ts
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxOption,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';
```

## Usage

Assemble the combobox directives in your template.

```html
<div ngpCombobox>
  <input ngpComboboxInput />
  <button ngpComboboxButton>▼</button>
  <div ngpComboboxDropdown>
    @for (option of options; track option) {
    <div ngpComboboxOption [ngpComboboxOptionValue]="option">{{ option }}</div>
    }
  </div>
</div>
```

### Without Input Field

You can also create a combobox without an input field, which is useful for select-like behavior with keyboard navigation:

```html
<div ngpCombobox>
  <button ngpComboboxButton>{{ selectedOption || 'Select an option' }} ▼</button>
  <div ngpComboboxDropdown>
    @for (option of options; track option) {
    <div ngpComboboxOption [ngpComboboxOptionValue]="option">{{ option }}</div>
    }
  </div>
</div>
```

When no input is present, the combobox element itself becomes focusable and supports full keyboard navigation.

## Reusable Component

Create a reusable component that uses the `NgpCombobox` directive.

<docs-snippet name="combobox"></docs-snippet>

## Examples

### Button-only Combobox

This example demonstrates a combobox without an input field. The combobox element itself becomes focusable.

<docs-example name="combobox-button"></docs-example>

### Multiple Selection with chips

<docs-example name="combobox-multiple"></docs-example>

### Select All Functionality

The combobox supports a "Select All" option for multiple selection mode, allowing users to select or deselect all options at once.

<docs-example name="combobox-select-all"></docs-example>

### Virtualized Large Lists

When dealing with large datasets (thousands of items), you can use TanStack Virtual or other virtualization libraries to efficiently render only the visible options, improving performance:

<docs-example name="combobox-virtual"></docs-example>

#### Select All Features

- **Toggle All**: Click to select all options if not all are selected, or deselect all if all are selected
- **Visual State**: The "Select All" option shows as selected when all individual options are selected
- **Filtering Support**: When options are filtered, "Select All" only affects currently visible options
- **Keyboard Navigation**: Full keyboard support with Arrow keys and Enter
- **Multiple Mode Only**: Automatically disabled in single selection mode

To implement Select All, use the special value `'all'` for your Select All option:

```html
<div ngpComboboxOptionValue="all" ngpComboboxOption>Select All</div>
```

## Schematics

Generate a reusable combobox component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive combobox
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/combobox` package:

### NgpCombobox

The main container for the combobox.

<api-docs name="NgpCombobox"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpCombobox` directive:

| Attribute       | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| `data-open`     | Applied when the combobox is open.                             |
| `data-disabled` | Applied when the combobox is disabled.                         |
| `data-multiple` | Applied when the combobox is in multiple mode.                 |
| `data-hover`    | Applied when the combobox is hovered.                          |
| `data-press`    | Applied when the combobox is pressed.                          |
| `data-focus`    | Applied when the combobox has focus within it.                 |
| `data-invalid`  | Applied when the combobox is invalid.                          |
| `data-valid`    | Applied when the combobox is valid.                            |
| `data-touched`  | Applied when the combobox has been touched.                    |
| `data-pristine` | Applied when the combobox is pristine (not modified).          |
| `data-dirty`    | Applied when the combobox has been modified.                   |
| `data-pending`  | Applied when the combobox is pending (e.g., async validation). |
| `data-disabled` | Applied when the combobox is disabled.                         |

#### Focus Management

When no `ngpComboboxInput` is present, the combobox element itself receives:

- `tabindex="0"` to make it focusable via keyboard navigation
- `tabindex="-1"` when disabled or when an input is present
- Full keyboard navigation support

### NgpComboboxButton

The button that toggles the combobox dropdown.

<api-docs name="NgpComboboxButton"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpComboboxButton` directive:

| Attribute       | Description                                    |
| --------------- | ---------------------------------------------- |
| `data-open`     | Applied when the combobox is open.             |
| `data-disabled` | Applied when the combobox is disabled.         |
| `data-multiple` | Applied when the combobox is in multiple mode. |

### NgpComboboxDropdown

The dropdown that contains the combobox options.

<api-docs name="NgpComboboxDropdown"></api-docs>

#### CSS Custom Properties

The following CSS custom properties are applied to the `ngpComboboxDropdown` directive:

| Property                          | Description                                      |
| --------------------------------- | ------------------------------------------------ |
| `--ngp-combobox-transform-origin` | The transform origin for the dropdown animation. |
| `--ngp-combobox-width`            | The width of the combobox dropdown.              |
| `--ngp-combobox-input-width`      | The width of the combobox input field.           |
| `--ngp-combobox-button-width`     | The width of the combobox button.                |

### NgpComboboxInput

The input field for the combobox.

<api-docs name="NgpComboboxInput"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpComboboxInput` directive:

| Attribute       | Description                                                 |
| --------------- | ----------------------------------------------------------- |
| `data-open`     | Applied when the combobox is open.                          |
| `data-disabled` | Applied when the combobox is disabled.                      |
| `data-multiple` | Applied when the combobox is in multiple mode.              |
| `data-invalid`  | Applied when the input is invalid.                          |
| `data-valid`    | Applied when the input is valid.                            |
| `data-touched`  | Applied when the input has been touched.                    |
| `data-pristine` | Applied when the input is pristine (not modified).          |
| `data-dirty`    | Applied when the input has been modified.                   |
| `data-pending`  | Applied when the input is pending (e.g., async validation). |
| `data-disabled` | Applied when the input is disabled.                         |

### NgpComboboxOption

The individual options within the combobox dropdown.

<api-docs name="NgpComboboxOption"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpComboboxOption` directive:

| Attribute       | Description                          |
| --------------- | ------------------------------------ |
| `data-selected` | Applied when the option is selected. |
| `data-active`   | Applied when the option is active.   |
| `data-disabled` | Applied when the option is disabled. |

### NgpComboboxPortal

The portal for rendering the combobox dropdown in an overlay.

<api-docs name="NgpComboboxPortal"></api-docs>

## Animations

The `ngpComboboxDropdown` primitive adds a CSS custom property `--ngp-combobox-transform-origin` to the element that can be used to animate the menu from the trigger element.

The `ngpComboboxDropdown` will also add the `data-enter` and `data-exit` attributes to the element when it is being added or removed from the DOM. This can be used to trigger animations.

```css
:host[data-enter] {
  animation: fade-in 0.2s ease-in-out;
}

:host[data-exit] {
  animation: fade-out 0.2s ease-in-out;
}
```

## Global Configuration

You can configure the default options for all comboboxes in your application by using the `provideComboboxConfig` function in a providers array.

```ts
import { provideComboboxConfig } from 'ng-primitives/combobox';

bootstrapApplication(AppComponent, {
  providers: [provideComboboxConfig({ placement: 'bottom', container: document.body })],
});
```

### NgpComboboxConfig

<prop-details name="placement" type="'top' | 'right' | 'bottom' | 'left'">
  Define the placement of the combobox dropdown.
</prop-details>

<prop-details name="container" type="HTMLElement" default="document.body">
  Define the container element for the combobox dropdown. This is useful for rendering the dropdown in a specific part of the DOM.
</prop-details>

## Accessibility

Adheres to the [WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) guidelines for comboboxes.

### Keyboard Interactions

The combobox supports comprehensive keyboard navigation whether or not an input field is present:

#### With Input Field

- <kbd>ArrowDown</kbd>: Open the dropdown and focus the first option. If the dropdown is already open, move focus to the next option.
- <kbd>ArrowUp</kbd>: Open the dropdown and focus the last option. If the dropdown is already open, move focus to the previous option.
- <kbd>Home</kbd>: Move focus to the first option (when dropdown is open).
- <kbd>End</kbd>: Move focus to the last option (when dropdown is open).
- <kbd>Enter</kbd>: Toggle the selection state of the focused option. In single selection mode, this will select the option and close the dropdown. In multiple selection mode, this will toggle the option without closing the dropdown.
- <kbd>Escape</kbd>: Close the dropdown without selecting an option.
- <kbd>Any character key</kbd>: Open the dropdown and filter options based on typed text.

#### Without Input Field

When no `ngpComboboxInput` is present, the combobox container becomes focusable and supports:

- <kbd>Tab</kbd>: Focus the combobox container.
- <kbd>ArrowDown</kbd>: Open the dropdown and focus the first option. If already open, move to the next option.
- <kbd>ArrowUp</kbd>: Open the dropdown and focus the last option. If already open, move to the previous option.
- <kbd>Home</kbd>: Move focus to the first option (when dropdown is open).
- <kbd>End</kbd>: Move focus to the last option (when dropdown is open).
- <kbd>Enter</kbd>: Select the focused option and close the dropdown.
- <kbd>Escape</kbd>: Close the dropdown without selecting an option.
