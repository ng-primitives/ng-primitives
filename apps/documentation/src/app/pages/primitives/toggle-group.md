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

## Examples

Here are some additional examples of how to use the Toggle Group primitives.

### Multiple Selection

The toggle group can be configured to allow multiple selections by setting the `ngpToggleGroupType` input to `multiple`.

<docs-example name="toggle-group-multiple"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/toggle-group` package:

### NgpToggleGroup

- Selector: `[ngpToggleGroup]`
- Exported As: `ngpToggleGroup`

<response-field name="ngpToggleGroupOrientation" type="'horizontal' | 'vertical'" default="horizontal">
  The orientation of the toggle group.
</response-field>

<response-field name="ngpToggleGroupValue" type="string | string[]">
  he selected value(s) of the toggle group.
</response-field>

<response-field name="ngpToggleGroupType" type="single | multiple" default="single">
  The type of the toggle group, whether only one item can be selected or multiple.
</response-field>

<response-field name="ngpToggleGroupDisabled" type="boolean" default="false">
  Whether the toggle group is disabled.
</response-field>

#### Data Attributes

The following data attributes are available to style the toggle group:

| Attribute          | Description                                | Value                      |
| ------------------ | ------------------------------------------ | -------------------------- |
| `data-disabled`    | Applied when the toggle group is disabled. | `-`                        |
| `data-orientation` | The orientation of the toggle group.       | `horizontal` \| `vertical` |
| `data-type`        | The type of the toggle group.              | `single` \| `multiple`     |

### NgpToggleGroupItem

- Selector: `[ngpToggleGroupItem]`
- Exported As: `ngpToggleGroupItem`

<response-field name="ngpToggleGroupItemValue" type="string">
  The value of the toggle group item.
</response-field>

<response-field name="ngpToggleGroupItemDisabled" type="boolean" default="false">
  Whether the toggle group item is disabled.
</response-field>

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

<response-field name="orientation" type="'horizontal' | 'vertical'" default="horizontal">
  The default orientation of the toggle group.
</response-field>

<response-field name="type" type="'single' | 'multiple'" default="single">
  The default type of the toggle group.
</response-field>

### Keyboard Interaction

- <kbd>Tab</kbd> - Moves focus to the first toggle group item in the toolbar.
- <kbd>Arrow Down</kbd> - Moves focus to the next toggle group item (vertical orientation).
- <kbd>Arrow Up</kbd> - Moves focus to the previous toggle group item (vertical orientation).
- <kbd>Arrow Right</kbd> - Moves focus to the next toggle group item (horizontal orientation).
- <kbd>Arrow Left</kbd> - Moves focus to the previous toggle group item (horizontal orientation).
- <kbd>Home</kbd> - Moves focus to the first toggle group item.
- <kbd>End</kbd> - Moves focus to the last toggle group item.
