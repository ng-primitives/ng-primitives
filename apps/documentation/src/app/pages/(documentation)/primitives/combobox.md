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

## Reusable Component

Create a reusable component that uses the `NgpCombobox` directive.

<docs-snippet name="combobox"></docs-snippet>

## Multiple Selection with chips

<docs-example name="combobox-multiple"></docs-example>

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

- <kbd>ArrowDown</kbd>: Open the dropdown and focus the first option. If the dropdown is already open, move focus to the next option.
- <kbd>ArrowUp</kbd>: Move focus to the previous option.
- <kbd>Enter</kbd>: Select the focused option and close the dropdown.
- <kbd>Escape</kbd>: Close the dropdown without selecting an option.
