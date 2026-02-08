---
name: 'Textarea'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/textarea'
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

## Reusable Component

Create an textarea component that uses the `NgpTextarea` directive.

<docs-snippet name="textarea"></docs-snippet>

## Schematics

Generate a reusable textarea component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive textarea
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Textarea primitive.

### Textarea Form Field

The textarea automatically integrates with the form field primitives.

<docs-example name="textarea-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/textarea` package:

### NgpTextarea

<api-docs name="NgpTextarea"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpTextarea` directive:

| Attribute       | Description                           |
| --------------- | ------------------------------------- |
| `data-hover`    | Applied when the element is hovered.  |
| `data-focus`    | Applied when the element is focused.  |
| `data-disabled` | Applied when the element is disabled. |
