---
name: 'Autocomplete'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/autocomplete'
---

# Autocomplete

The Autocomplete primitive combines a text input with a filterable dropdown list, allowing users to type and select from matching options.

<docs-example name="autocomplete"></docs-example>

## Import

Import the Autocomplete primitives from `ng-primitives/autocomplete`.

```ts
import {
  NgpAutocomplete,
  NgpAutocompleteButton,
  NgpAutocompleteDropdown,
  NgpAutocompleteInput,
  NgpAutocompleteOption,
  NgpAutocompletePortal,
} from 'ng-primitives/autocomplete';
```

## Usage

Assemble the autocomplete directives in your template.

```html
<div ngpAutocomplete>
  <input ngpAutocompleteInput />
  <button ngpAutocompleteButton>▼</button>
  <div *ngpAutocompletePortal ngpAutocompleteDropdown>
    @for (option of options; track option) {
    <div ngpAutocompleteOption [ngpAutocompleteOptionValue]="option">{{ option }}</div>
    }
  </div>
</div>
```

## API Reference

The following directives are available to import from the `ng-primitives/autocomplete` package:

### NgpAutocomplete

The main container for the autocomplete.

<api-docs name="NgpAutocomplete"></api-docs>

<api-reference-props name="NgpAutocomplete"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the autocomplete is open." />
  <api-attribute name="data-disabled" description="Applied when the autocomplete is disabled." />
  <api-attribute name="data-hover" description="Applied when the autocomplete is hovered." />
  <api-attribute name="data-press" description="Applied when the autocomplete is pressed." />
  <api-attribute name="data-focus" description="Applied when the autocomplete has focus within it." />
  <api-attribute name="data-invalid" description="Applied when the autocomplete is invalid." />
  <api-attribute name="data-valid" description="Applied when the autocomplete is valid." />
  <api-attribute name="data-touched" description="Applied when the autocomplete has been touched." />
  <api-attribute name="data-pristine" description="Applied when the autocomplete is pristine (not modified)." />
  <api-attribute name="data-dirty" description="Applied when the autocomplete has been modified." />
  <api-attribute name="data-pending" description="Applied when the autocomplete is pending (e.g., async validation)." />
</api-reference-attributes>

### NgpAutocompleteButton

The button that toggles the autocomplete dropdown.

<api-docs name="NgpAutocompleteButton"></api-docs>

<api-reference-props name="NgpAutocompleteButton"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the autocomplete is open." />
  <api-attribute name="data-disabled" description="Applied when the autocomplete is disabled." />
</api-reference-attributes>

### NgpAutocompleteDropdown

The dropdown that contains the autocomplete options.

<api-docs name="NgpAutocompleteDropdown"></api-docs>

<api-reference-props name="NgpAutocompleteDropdown"></api-reference-props>

<api-reference-css-vars>
  <api-css-var name="--ngp-autocomplete-transform-origin" description="The transform origin for the dropdown animation." />
  <api-css-var name="--ngp-autocomplete-available-width" description="The available width of the dropdown before it overflows the viewport." />
  <api-css-var name="--ngp-autocomplete-available-height" description="The available height of the dropdown before it overflows the viewport." />
  <api-css-var name="--ngp-autocomplete-width" description="The width of the autocomplete dropdown." />
  <api-css-var name="--ngp-autocomplete-input-width" description="The width of the autocomplete input field." />
  <api-css-var name="--ngp-autocomplete-button-width" description="The width of the autocomplete button." />
</api-reference-css-vars>

### NgpAutocompleteInput

The input field for the autocomplete.

<api-docs name="NgpAutocompleteInput"></api-docs>

<api-reference-props name="NgpAutocompleteInput"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the autocomplete is open." />
  <api-attribute name="data-disabled" description="Applied when the autocomplete is disabled." />
  <api-attribute name="data-invalid" description="Applied when the input is invalid." />
  <api-attribute name="data-valid" description="Applied when the input is valid." />
  <api-attribute name="data-touched" description="Applied when the input has been touched." />
  <api-attribute name="data-pristine" description="Applied when the input is pristine (not modified)." />
  <api-attribute name="data-dirty" description="Applied when the input has been modified." />
  <api-attribute name="data-pending" description="Applied when the input is pending (e.g., async validation)." />
</api-reference-attributes>

### NgpAutocompleteOption

The individual options within the autocomplete dropdown.

<api-docs name="NgpAutocompleteOption"></api-docs>

<api-reference-props name="NgpAutocompleteOption"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-selected" description="Applied when the option is selected." />
  <api-attribute name="data-active" description="Applied when the option is active." />
  <api-attribute name="data-disabled" description="Applied when the option is disabled." />
</api-reference-attributes>

### NgpAutocompletePortal

The portal for rendering the autocomplete dropdown in an overlay.

<api-docs name="NgpAutocompletePortal"></api-docs>

<api-reference-props name="NgpAutocompletePortal"></api-reference-props>

## Animations

The `ngpAutocompleteDropdown` primitive adds a CSS custom property `--ngp-autocomplete-transform-origin` to the element that can be used to animate the dropdown from the trigger element.

The `ngpAutocompleteDropdown` will also add the `data-enter` and `data-exit` attributes to the element when it is being added or removed from the DOM. This can be used to trigger animations.

```css
:host[data-enter] {
  animation: fade-in 0.2s ease-in-out;
}

:host[data-exit] {
  animation: fade-out 0.2s ease-in-out;
}
```

## Global Configuration

You can configure the default options for all autocompletes in your application by using the `provideAutocompleteConfig` function in a providers array.

```ts
import { provideAutocompleteConfig } from 'ng-primitives/autocomplete';

bootstrapApplication(AppComponent, {
  providers: [
    provideAutocompleteConfig({
      placement: 'bottom',
      container: document.body,
      flip: true,
      offset: 4,
    }),
  ],
});
```

### NgpAutocompleteConfig

<api-reference-config name="NgpAutocompleteConfig"></api-reference-config>

## Accessibility

Adheres to the [WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) guidelines for comboboxes.

### Keyboard Interactions

- <kbd>ArrowDown</kbd>: Open the dropdown and focus the first option. If the dropdown is already open, move focus to the next option.
- <kbd>ArrowUp</kbd>: Open the dropdown and focus the last option. If the dropdown is already open, move focus to the previous option.
- <kbd>Home</kbd>: Move focus to the first option (when dropdown is open).
- <kbd>End</kbd>: Move focus to the last option (when dropdown is open).
- <kbd>Enter</kbd>: Select the focused option and close the dropdown.
- <kbd>Escape</kbd>: Close the dropdown without selecting an option.
- <kbd>Any character key</kbd>: Open the dropdown and filter options based on typed text.
