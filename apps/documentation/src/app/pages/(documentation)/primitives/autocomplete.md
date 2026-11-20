---
title: Autocomplete | Angular Primitives
name: 'Autocomplete'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/autocomplete'
---

# Autocomplete

The Autocomplete primitive pairs a text input with a list of suggestions. Users type freely and can select a suggestion with a click or <kbd>Enter</kbd>. What happens to the text and the selected value is up to you.

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
<div
  ngpAutocomplete
  [ngpAutocompleteSelectedValue]="value()"
  (ngpAutocompleteSelected)="onSelected($event)"
>
  <input ngpAutocompleteInput [value]="query()" (input)="onInput($event)" />
  <button ngpAutocompleteButton>▼</button>
  <div *ngpAutocompletePortal ngpAutocompleteDropdown>
    @for (option of options(); track option) {
    <div ngpAutocompleteOption [ngpAutocompleteOptionValue]="option">{{ option }}</div>
    }
  </div>
</div>
```

The autocomplete never writes the text or a value itself. `ngpAutocompleteSelected` emits the selected option's value every time, even for the option already chosen, and your handler decides what to do with it.

```ts
onSelected(option: string): void {
  this.value.set(option);
  this.query.set(option);
}

onInput(event: Event): void {
  this.query.set((event.target as HTMLInputElement).value);
  // the text no longer names the chosen option
  this.value.set(undefined);
}
```

`ngpAutocompleteSelectedValue` is optional and only read. The matching option gets `data-selected`, and the button and the arrow keys open the dropdown on it. Typing opens the dropdown from `ngpAutocompleteMinLength` characters (1 by default) with no active option, so <kbd>Enter</kbd> keeps the typed text.

## Examples

### Highlight mode

With `ngpAutocompleteAutoActivate`, typing makes the first option active, so <kbd>Enter</kbd> selects it. Bind the active option's label to `ngpAutocompleteInputSuggestion` and the input completes the typed text. The rest of the label appears after the caret, selected, so the next keystroke replaces it.

<docs-example name="autocomplete-highlight"></docs-example>

```html
<div
  ngpAutocomplete
  ngpAutocompleteAutoActivate
  (ngpAutocompleteActiveValueChange)="active.set($event)"
  (ngpAutocompleteSelected)="query.set($event)"
>
  <input
    ngpAutocompleteInput
    [value]="query()"
    [ngpAutocompleteInputSuggestion]="active()"
    (input)="query.set($any($event.target).value)"
  />
  ...
</div>
```

The completion only shows when the label starts with the typed text, ignoring case, and it never reaches your value on its own. <kbd>Enter</kbd> or a click selects the option. Moving the caret past the completion keeps it as typed text, with an `input` event. <kbd>Backspace</kbd>, <kbd>Escape</kbd> or leaving the input removes it. Without a suggestion, `ngpAutocompleteAutoActivate` still suits a search where <kbd>Enter</kbd> takes the first result.

### Mentions

A fragment matcher limits the search to part of the text, such as a mention. `ngpAutocompleteInputFragmentMatcher="@"` matches the word under the caret that starts with `@`, and `['@', '#']` takes several triggers. The dropdown opens at the fragment when one appears under the caret and closes when it goes, and `ngpAutocompleteInputFragmentChange` emits it. The input can be a `textarea`.

<docs-example name="autocomplete-mention"></docs-example>

```html
<div ngpAutocomplete (ngpAutocompleteSelected)="message.replaceFragment('@' + $event.handle + ' ')">
  <textarea
    #message="ngpAutocompleteInput"
    ngpAutocompleteInput
    ngpAutocompleteInputFragmentMatcher="@"
    (ngpAutocompleteInputFragmentChange)="query.set($event?.query ?? '')"
  ></textarea>
  ...
</div>
```

A fragment has a `start` and an `end`, the range to replace, and a `query` without the trigger. `replaceFragment` writes your text over that range, puts the caret after it and dispatches an `input` event. For another rule, bind a function `(text, caret) => fragment | null`.

In this example, `ngpAutocompleteAutoActivate` makes the first person active, so <kbd>Enter</kbd> inserts the mention instead of a new line, and `ngpAutocompleteMinLength` is `0`, so the trigger alone opens the dropdown. While the dropdown is closed, the textarea keeps all its keys.

### Custom editor

`ngpAutocompleteInput` is optional. To show mentions as chips, or to connect a rich-text editor, drive the autocomplete from your own element inside `ngpAutocomplete`, through `#autocomplete="ngpAutocomplete"`. This example inserts each mention into a `contenteditable` element as a chip that keeps the whole name, spaces included.

<docs-example name="autocomplete-editor"></docs-example>

```html
<div
  ngpAutocomplete
  #autocomplete="ngpAutocomplete"
  (ngpAutocompleteSelected)="insertMention($event)"
>
  <div
    contenteditable="true"
    role="textbox"
    aria-multiline="true"
    aria-haspopup="listbox"
    aria-autocomplete="list"
    [attr.aria-controls]="autocomplete.open() ? autocomplete.dropdownId() : null"
    [attr.aria-activedescendant]="autocomplete.activeOptionId()"
    (input)="onInput()"
    (keydown)="autocomplete.onKeydown($event)"
  ></div>
  ...
</div>
```

Your element calls these methods:

- `onKeydown(event)` handles the arrow keys and <kbd>Enter</kbd> while the dropdown is open, and prevents their default. Any other key, or <kbd>Enter</kbd> with no active option, goes on to your element. <kbd>Escape</kbd> closes the dropdown on its own.
- `setQuery(query)` as the user types, or `null` when there is nothing to search. It applies `ngpAutocompleteMinLength` and `ngpAutocompleteAutoActivate` as typing does, and ignores the same query reported again while the dropdown is open.
- `setPosition(() => ({ x, y }))` with a function that measures the viewport position, such as the trigger's `range.getBoundingClientRect()`. The autocomplete measures it again when the page scrolls or resizes. A plain `{ x, y }` stays where it is.
- `closeDropdown()` when the caret leaves the mention. `openDropdown()`, `activateNextOption()`, `activatePreviousOption()` and `selectActiveOption()` are there for other keys or controls.

`open()`, `dropdownId()` and `activeOptionId()` feed its ARIA attributes, and `createFragmentMatcher('@')` finds the mention in the text node that holds the caret. Keep the element inside `ngpAutocomplete`, so a press on it leaves the dropdown open and focus leaving the autocomplete closes it. Pressing an option leaves focus and the caret in your element. With Tiptap's suggestion utility, call the same methods from `onStart`, `onUpdate` and `onExit`, and return `event.defaultPrevented` from `onKeyDown` after `onKeydown(event)`.

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

The input field for the autocomplete, an `input` or a `textarea`.

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
  <api-attribute name="data-selected" description="Applied when the option's value matches ngpAutocompleteSelectedValue." />
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

- <kbd>ArrowDown</kbd>: Open the dropdown and activate the selected option, or the first option when none is selected. If the dropdown is already open, move to the next option.
- <kbd>ArrowUp</kbd>: Open the dropdown and activate the selected option, or the last option when none is selected. If the dropdown is already open, move to the previous option.
- <kbd>Home</kbd>: Move the caret to the start of the text.
- <kbd>End</kbd>: Move the caret to the end of the text.
- <kbd>Enter</kbd>: Select the active option and close the dropdown. With no active option, close the dropdown and leave <kbd>Enter</kbd> to the browser, for example to submit a form.
- <kbd>Escape</kbd>: Close the dropdown without selecting an option. While the dropdown is closed, it is left to the page, so an enclosing dialog still closes.
- <kbd>Any character key</kbd>: Open the dropdown once the text reaches the minimum length. No option is active, unless `ngpAutocompleteAutoActivate` makes it the first one.

With a fragment matcher, these keys only apply while the dropdown is open. Without `ngpAutocompleteInput`, pass the keys of your own element to `onKeydown`.

Focus stays on the input, which points at the active option with `aria-activedescendant`. The active option carries `aria-selected="true"`, as the pattern expects. `data-selected` only reflects `ngpAutocompleteSelectedValue` and has no ARIA equivalent, so do not rely on it alone to convey the chosen value.

Your own element needs the attributes shown in the Custom editor example. A single-line element takes `role="combobox"` with `aria-expanded` from `open()`. A multi-line one keeps `role="textbox"` with `aria-multiline="true"`, as the input does for a `textarea`.
