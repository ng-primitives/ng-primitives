---
name: 'Number Picker'
---

# Number Picker

A field for selecting a number. The number picker allows users to select a number by using buttons, scrubbing or by typing in the input field.

<docs-example name="number-picker"></docs-example>

## Import

Import the NumberPicker primitives from `ng-primitives/number-picker`.

```ts
import { NgpNumberPicker } from 'ng-primitives/number-picker';
```

## Usage

Assemble the number-picker directives in your template.

```html
<div ngpNumberPicker></div>
```

## Reusable Component

Create a reusable component that uses the `NgpNumberPicker` directive.

<docs-snippet name="number-picker"></docs-snippet>

## Schematics

Generate a reusable number-picker component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive number-picker
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/number-picker` package:

### NgpNumberPicker

- Selector: `[ngpNumberPicker]`
- Exported As: `ngpNumberPicker`

## Global Configuration

You can configure the default options for all number-pickers in your application by using the `provideNumberPickerConfig` function in a providers array.

```ts
import { provideNumberPickerConfig } from 'ng-primitives/number-picker';

bootstrapApplication(AppComponent, {
  providers: [provideNumberPickerConfig({})],
});
```

### NgpNumberPickerConfig
