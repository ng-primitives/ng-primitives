---
name: 'Autofill'
---

# Autofill

Detect autofill events on input elements. This can be useful for styling or behavior changes when the browser autofills an input.
Floating labels are a common use case for this directive.

<docs-example name="autofill"></docs-example>

## Import

Import the Autofill primitives from `ng-primitives/autofill`.

```ts
import { NgpAutofill } from 'ng-primitives/autofill';
```

## Usage

Assemble the autofill directives in your template.

```html
<input ngpAutofill />
```

## API Reference

The following directives are available to import from the `ng-primitives/autofill` package:

### NgpAutofill

- Selector: `[ngpAutofill]`
- Exported As: `ngpAutofill`

<response-field name="ngpAutofill" type="OutputEmitterRef<boolean>">
  Event emitted when the autofill state changes.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpAutofill` directive:

| Attribute       | Description                             |
| --------------- | --------------------------------------- |
| `data-autofill` | Applied when the element is autofilled. |
