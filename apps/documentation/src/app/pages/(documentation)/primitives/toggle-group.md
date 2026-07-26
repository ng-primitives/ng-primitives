---
title: Toggle Group | Angular Primitives
name: 'Toggle Group'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/toggle-group'
---

# Toggle Group

The toggle group primitive is a collection of toggle buttons that can be used to select one or more options.

<docs-example name="toggle-group"></docs-example>

## Import

Import the ToggleGroup primitives from `ng-primitives/toggle-group`.

```ts
import { NgpToggleGroup, NgpToggleGroupItem } from 'ng-primitives/toggle-group';
```

## Usage

Assemble the toggle-group directives in your template.

```html
<div ngpToggleGroup>
  <button ngpToggleGroupItem ngpToggleGroupItemValue="1">Option 1</button>
  <button ngpToggleGroupItem ngpToggleGroupItemValue="2">Option 2</button>
  <button ngpToggleGroupItem ngpToggleGroupItemValue="3">Option 3</button>
</div>
```

## Reusable Component

Create a reusable component that uses the toggle group directives.

<docs-snippet name="toggle-group"></docs-snippet>

## Schematics

Generate a reusable toggle group component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive toggle-group
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `styles`: How component styles should be generated. `css` (default) includes the full example styles; `unstyled` omits them entirely so you can style the component yourself.
- `example-styles` (deprecated): still supported for compatibility - `true` maps to `styles: css`, `false` maps to `styles: unstyled`.

## Examples

Here are some additional examples of how to use the Toggle Group primitives.

### Multiple Selection

The toggle group can be configured to allow multiple selections by setting the `ngpToggleGroupType` input to `multiple`.

<docs-example name="toggle-group-multiple"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/toggle-group` package:

### NgpToggleGroup

<api-docs name="NgpToggleGroup"></api-docs>

<api-reference-props name="NgpToggleGroup"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the toggle group is disabled." />
  <api-attribute name="data-orientation" description="The orientation of the toggle group." value="horizontal | vertical" />
  <api-attribute name="data-type" description="The type of the toggle group." value="single | multiple" />
</api-reference-attributes>

### NgpToggleGroupItem

<api-docs name="NgpToggleGroupItem"></api-docs>

<api-reference-props name="NgpToggleGroupItem"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the toggle group item is disabled." />
  <api-attribute name="data-selected" description="Applied when the toggle group item is selected." />
</api-reference-attributes>

## Global Configuration

You can configure the default options for all toggle-groups in your application by using the `provideToggleGroupConfig` function in a providers array.

```ts
import { provideToggleGroupConfig } from 'ng-primitives/toggle-group';

bootstrapApplication(AppComponent, {
  providers: [
    provideToggleGroupConfig({
      orientation: 'vertical',
      type: 'multiple',
    }),
  ],
});
```

### NgpToggleGroupConfig

<api-reference-config name="NgpToggleGroupConfig"></api-reference-config>

## Accessibility

The toggle group uses `role="group"` on the container. In a single-select group each item uses `role="radio"` with `aria-checked`; in a multiple-select group the items are toggle buttons exposing `aria-pressed` instead. Keyboard navigation follows the roving tabindex pattern.

### Keyboard Interactions

- <kbd>Tab</kbd>: Move focus into the toggle group to the active or first item.
- <kbd>ArrowDown</kbd>: Move focus to the next item (vertical orientation).
- <kbd>ArrowUp</kbd>: Move focus to the previous item (vertical orientation).
- <kbd>ArrowRight</kbd>: Move focus to the next item (horizontal orientation).
- <kbd>ArrowLeft</kbd>: Move focus to the previous item (horizontal orientation).
- <kbd>Home</kbd>: Move focus to the first item.
- <kbd>End</kbd>: Move focus to the last item.
