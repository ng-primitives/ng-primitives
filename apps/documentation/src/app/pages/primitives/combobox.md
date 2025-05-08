---
name: 'Combobox'
---

# Combobox

Enter a description here

<docs-example name="combobox"></docs-example>

## Import

Import the Combobox primitives from `ng-primitives/combobox`.

```ts
import { NgpCombobox } from 'ng-primitives/combobox';
```

## Usage

Assemble the combobox directives in your template.

```html
<div ngpCombobox></div>
```

## Reusable Component

Create a reusable component that uses the `NgpCombobox` directive.

<docs-snippet name="combobox"></docs-snippet>

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

- Selector: `[ngpCombobox]`
- Exported As: `ngpCombobox`
