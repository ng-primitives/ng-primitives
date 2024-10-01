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

## Examples

Here are some additional examples of how to use the Textarea primitive.

### Textarea Form Field

The textarea automatically integrates with the form field primitives.

<docs-example name="textarea-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/textarea` package:

### NgpTextarea

- Selector: `[ngpTextarea]`
- Exported As: `ngpTextarea`
- Host Directives: [NgpFormControl](/primitives/form-field), [NgpHover](/interactions/hover), [NgpFocus](/interactions/focus), [NgpPress](/interactions/press)

#### Data Attributes

The following data attributes are applied to the `ngpTextarea` directive:

| Attribute       | Description                           |
| --------------- | ------------------------------------- |
| `data-hover`    | Applied when the element is hovered.  |
| `data-focus`    | Applied when the element is focused.  |
| `data-disabled` | Applied when the element is disabled. |
