---
name: 'Input'
---

# Input

The input primitive can be used to enhance the accessibility of an input element and provide consistent interaction handling for hover, focus, press and autofill states.

<docs-example name="input"></docs-example>

## Import

Import the Input primitives from `ng-primitives/input`.

```ts
import { NgpInput } from 'ng-primitives/input';
```

## Usage

Assemble the input directives in your template.

```html
<input ngpInput type="text" />
```

## Reusable Component

Create an input component that uses the `NgpInput` directive.

<docs-snippet name="input"></docs-snippet>

## Schematics

Generate a reusable input component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive input
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Input primitive.

### Input Form Field

The input automatically integrates with the form field primitives.

<docs-example name="input-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/input` package:

### NgpInput

<api-docs name="NgpInput"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpInput` directive:

| Attribute       | Description                           |
| --------------- | ------------------------------------- |
| `data-hover`    | Applied to the input when hovered.    |
| `data-focus`    | Applied to the input when focused.    |
| `data-disabled` | Applied to the input when disabled.   |
| `data-autofill` | Applied to the input when autofilled. |
