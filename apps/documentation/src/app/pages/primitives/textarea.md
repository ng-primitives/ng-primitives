---
name: 'Textarea'
---

# Textarea

The textarea primitive can be used to enhance the accessibility of a textarea element and provide consistent interaction handling for hover, focus and press states.

<docs-example name="textarea"></docs-example>

## Import

Import the Textarea primitives from `ng-primitives/textarea`.

```ts
import { NgpTextarea } from 'ng-primitives/textarea';
```

## Usage

Assemble the textarea directives in your template.

```html
<textarea ngpTextarea></textarea>
```

## API Reference

The following directives are available to import from the `ng-primitives/textarea` package:

### NgpTextarea

- Selector: `[ngpTextarea]`
- Exported As: `ngpTextarea`
- Host Directives: [NgpFormControl](/primitives/form-field), [NgpHover](/interactions/hover), [NgpFocus](/interactions/focus), [NgpPress](/interactions/press)

#### Data Attributes

The following data attributes are applied to the `ngpTextarea` directive:

| Attribute       | Description                      | Value             |
| --------------- | -------------------------------- | ----------------- |
| `data-hover`    | The hover state of the input.    | `true` \| `false` |
| `data-focus`    | The focus state of the input.    | `true` \| `false` |
| `data-disabled` | The disabled state of the input. | `true` \| `false` |
