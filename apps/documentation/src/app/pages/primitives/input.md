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

| Attribute       | Description                      | Value             |
| --------------- | -------------------------------- | ----------------- |
| `data-hover`    | The hover state of the input.    | `true` \| `false` |
| `data-focus`    | The focus state of the input.    | `true` \| `false` |
| `data-disabled` | The disabled state of the input. | `true` \| `false` |
| `data-autofill` | The autofill state of the input. | `true` \| `false` |
