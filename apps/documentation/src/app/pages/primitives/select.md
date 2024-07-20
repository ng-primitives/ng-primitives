---
name: 'Select'
---

# Select

A select is a form control that allows users to select options from a list. This primitive enhances the native select element with improved accessibility and interaction handling for hover and focus.

<docs-example name="select"></docs-example>

## Import

Import the Select primitives from `ng-primitives/select`.

```ts
import { NgpSelect } from 'ng-primitives/select';
```

## Usage

Assemble the select directives in your template.

```html
<select ngpSelect>
  <option value="24">24 hours</option>
  <option value="12">12 hours</option>
</select>
```

## API Reference

The following directives are available to import from the `ng-primitives/select` package:

### NgpSelect

Apply the `ngpSelect` directive to a select element that you want to enhance.

- Selector: `[ngpSelect]`
- Exported As: `ngpSelect`
- Host Directives: [NgpFormControl](/primitives/form-field), [NgpHover](/interactions/hover), [NgpFocusVisible](/interactions/focus-visible), [NgpPress](/interactions/press)

<response-field name="ngpSelectDisabled" type="boolean">
  Define the disabled state.
</response-field>

#### Data Attributes

| Attribute            | Description                       | Value             |
| -------------------- | --------------------------------- | ----------------- |
| `data-hover`         | The hover state of the select.    | `true` \| `false` |
| `data-focus-visible` | The focus state of the select.    | `true` \| `false` |
| `data-disabled`      | The disabled state of the select. | `true` \| `false` |
