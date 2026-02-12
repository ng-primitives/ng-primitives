---
name: 'Select'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/select'
---

# Select

A select is a form control that allows users to select options from a list.

<docs-example name="select"></docs-example>

## Import

Import the Select primitives from `ng-primitives/select`.

```ts
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectPortal,
  NgpSelectOption,
} from 'ng-primitives/select';
```

## Usage

Assemble the select directives in your template.

```html
<div ngpSelect>
  <div *ngpSelectPortal ngpSelectDropdown>
    <div ngpSelectOptionValue="option-1" ngpSelectOption>One</div>
    <div ngpSelectOptionValue="option-2" ngpSelectOption>Two</div>
    <div ngpSelectOptionValue="option-3" ngpSelectOption>Three</div>
  </div>
</div>
```

## Reusable Component

Create a reusable component that uses the `NgpSelect` directive.

<docs-snippet name="select"></docs-snippet>

## Schematics

Generate a reusable select component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive select
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Select primitives.

### Select Form Field

The select can be used within a form field for better integration with form controls.

<docs-example name="select-form-field"></docs-example>

### Native Select

The native select is a simple wrapper around the native `select` element.

<docs-example name="native-select"></docs-example>

### Native Select Form Field

The select automatically integrates with the form field primitives.

<docs-example name="native-select-form-field"></docs-example>

### Select with Custom Container

The select component can be rendered inside a custom container. You can open DevTools and inspect the DOM to see it mounted within this container.

<docs-example name="select-custom-container"></docs-example>

### Virtualized Large Lists

When dealing with large datasets (thousands of items), you can use TanStack Virtual or other virtualization libraries to efficiently render only the visible options, improving performance:

<docs-example name="select-virtual"></docs-example>

### Custom Option Behavior

Options without a value do not perform any selection by default. You can use this to implement custom behavior, such as clearing the selection. These options are still included in keyboard navigation.

<docs-example name="select-custom-option"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/select` package:

### NgpSelect

<api-docs name="NgpSelect"></api-docs>

### NgpSelectDropdown

<api-docs name="NgpSelectDropdown"></api-docs>

### NgpSelectPortal

<api-docs name="NgpSelectPortal"></api-docs>

### NgpSelectOption

<api-docs name="NgpSelectOption"></api-docs>

### NgpNativeSelect

<api-docs name="NgpNativeSelect"></api-docs>

#### Data Attributes

| Attribute            | Description                           |
| -------------------- | ------------------------------------- |
| `data-hover`         | Applied when the element is hovered.  |
| `data-focus-visible` | Applied when the element is focused.  |
| `data-disabled`      | Applied when the element is disabled. |

#### CSS Custom Properties

The following CSS custom properties are applied to the `ngpSelectDropdown` directive:

| Property                         | Description                                                            |
| -------------------------------- | ---------------------------------------------------------------------- |
| `--ngp-select-transform-origin`  | The transform origin of the select dropdown for animations.            |
| `--ngp-select-available-width`   | The available width of the dropdown before it overflows the viewport.  |
| `--ngp-select-available-height`  | The available height of the dropdown before it overflows the viewport. |

## Global Configuration

You can configure the default options for all selects in your application by using the `provideSelectConfig` function in a providers array.

```ts
import { provideSelectConfig } from 'ng-primitives/select';

bootstrapApplication(AppComponent, {
  providers: [provideSelectConfig({ placement: 'bottom', container: document.body, flip: true })],
});
```

### NgpSelectConfig

<prop-details name="placement" type="Placement" default="'bottom'">
  Define the placement of the select dropdown.
</prop-details>

<prop-details name="container" type="HTMLElement" default="document.body">
  Define the container element for the select dropdown. This is useful for rendering the dropdown in a specific part of the DOM.
</prop-details>

<prop-details name="flip" type="boolean" default="true">
  Define whether the dropdown should flip to the opposite side when there is not enough space.
</prop-details>
