---
name: 'Switch'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/switch'
---

# Switch

Perform state toggling.

<docs-example name="switch"></docs-example>

## Import

Import the Switch primitives from `ng-primitives/switch`.

```ts
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';
```

## Usage

Assemble the switch directives in your template.

```html
<button ngpSwitch [(ngpSwitchChecked)]="checked">
  <span ngpSwitchThumb></span>
</button>
```

## Reusable Component

Create a reusable component that uses the switch directives.

<docs-snippet name="switch"></docs-snippet>

## Schematics

Generate a reusable switch component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive switch
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Switch primitives.

### Switch Form Field

The switch automatically integrates with the form field primitives.

<docs-example name="switch-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/switch` package:

### NgpSwitch

<api-docs name="NgpSwitch"></api-docs>

<api-reference-props name="NgpSwitch"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-checked" description="Applied when the switch is checked." />
  <api-attribute name="data-disabled" description="Applied when the switch is disabled." />
  <api-attribute name="data-hover" description="Applied when the switch is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the switch is focused." />
  <api-attribute name="data-press" description="Applied when the switch is pressed." />
</api-reference-attributes>

### NgpSwitchThumb

<api-docs name="NgpSwitchThumb"></api-docs>

<api-reference-props name="NgpSwitchThumb"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-checked" description="Applied when the switch is checked." />
  <api-attribute name="data-disabled" description="Applied when the switch is disabled." />
  <api-attribute name="data-hover" description="Applied when the switch thumb is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the switch thumb is focused." />
  <api-attribute name="data-press" description="Applied when the switch thumb is pressed." />
</api-reference-attributes>

## Accessibility

Adheres to the [WAI-ARIA switch design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).

### Keyboard Interactions

- <kbd>Space</kbd> - Toggle the switch state (when switch is a button).
- <kbd>Enter</kbd> - Toggle the switch state.
