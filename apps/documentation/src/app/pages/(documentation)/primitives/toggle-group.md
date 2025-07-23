---
name: 'Toggle Group'
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
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Toggle Group primitives.

### Multiple Selection

The toggle group can be configured to allow multiple selections by setting the `ngpToggleGroupType` input to `multiple`.

<docs-example name="toggle-group-multiple"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/toggle-group` package:

### NgpToggleGroup

<api-docs name="NgpToggleGroup"></api-docs>

#### Data Attributes

The following data attributes are available to style the toggle group:

| Attribute          | Description                                | Value                      |
| ------------------ | ------------------------------------------ | -------------------------- |
| `data-disabled`    | Applied when the toggle group is disabled. | `-`                        |
| `data-orientation` | The orientation of the toggle group.       | `horizontal` \| `vertical` |
| `data-type`        | The type of the toggle group.              | `single` \| `multiple`     |

### NgpToggleGroupItem

<api-docs name="NgpToggleGroupItem"></api-docs>

#### Data Attributes

The following data attributes are available to style the toggle group item:

| Attribute       | Description                                     | Value |
| --------------- | ----------------------------------------------- | ----- |
| `data-disabled` | Applied when the toggle group item is disabled. | `-`   |
| `data-selected` | Applied when the toggle group item is selected. | `-`   |

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

<prop-details name="orientation" type="'horizontal' | 'vertical'" default="horizontal">
  The default orientation of the toggle group.
</prop-details>

<prop-details name="type" type="'single' | 'multiple'" default="single">
  The default type of the toggle group.
</prop-details>

### Keyboard Interaction

- <kbd>Tab</kbd> - Moves focus to the first toggle group item in the toolbar.
- <kbd>Arrow Down</kbd> - Moves focus to the next toggle group item (vertical orientation).
- <kbd>Arrow Up</kbd> - Moves focus to the previous toggle group item (vertical orientation).
- <kbd>Arrow Right</kbd> - Moves focus to the next toggle group item (horizontal orientation).
- <kbd>Arrow Left</kbd> - Moves focus to the previous toggle group item (horizontal orientation).
- <kbd>Home</kbd> - Moves focus to the first toggle group item.
- <kbd>End</kbd> - Moves focus to the last toggle group item.
