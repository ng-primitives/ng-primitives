---
name: 'Input'
---

# Input

The input primitive can be used to enhance the accessibility of an input element and provide consistent interaction handling for hover, focus and press states.

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

## API Reference

The following directives are available to import from the `ng-primitives/input` package:

### NgpInput

- Selector: `[ngpInput]`
- Exported As: `ngpInput`

#### Data Attributes

The following data attributes are applied to the `ngpInput` directive:

| Attribute       | Description                      | Value             |
| --------------- | -------------------------------- | ----------------- |
| `data-hover`    | The hover state of the input.    | `true` \| `false` |
| `data-focus`    | The focus state of the input.    | `true` \| `false` |
| `data-disabled` | The disabled state of the input. | `true` \| `false` |
