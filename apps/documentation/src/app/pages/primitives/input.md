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

## Schematics

Generate an input component with the `NgpInput` primitive preconfigured.

```bash npm
 ng g ng-primitives:input
```

### Options

- `name`: The name of the component.
- `prefix`: The prefix to apply to the generated component selector.
- `directory`: The directory at which to create the component file.
- `style`: The file extension or preprocessor to use for style files.
- `inlineStyle`: Include styles inline in the component.ts file. Only CSS styles can be included inline.
- `inlineTemplate`: Include template inline in the component.ts file

## Examples

Here are some additional examples of how to use the Input primitive.

### Input Form Field

The input automatically integrates with the form field primitives.

<docs-example name="input-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/input` package:

### NgpInput

- Selector: `[ngpInput]`
- Exported As: `ngpInput`
- Host Directives: [NgpFormControl](/primitives/form-field), [NgpHover](/interactions/hover), [NgpFocus](/interactions/focus), [NgpPress](/interactions/press), [NgpAutofill](/utilities/autofill)

#### Data Attributes

The following data attributes are applied to the `ngpInput` directive:

| Attribute       | Description                           |
| --------------- | ------------------------------------- |
| `data-hover`    | Applied to the input when hovered.    |
| `data-focus`    | Applied to the input when focused.    |
| `data-disabled` | Applied to the input when disabled.   |
| `data-autofill` | Applied to the input when autofilled. |
