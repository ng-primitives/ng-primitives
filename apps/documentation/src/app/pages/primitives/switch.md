---
name: 'Switch'
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

## Examples

Here are some additional examples of how to use the Switch primitives.

### Switch Form Field

The switch automatically integrates with the form field primitives.

<docs-example name="switch-form-field"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/switch` package:

### NgpSwitch

Apply the `ngpSwitch` directive to an element to manage the checked state.

- Selector: `[ngpSwitch]`
- Exported As: `ngpSwitch`
- Host Directives: [NgpFormControl](/primitives/form-field), [NgpHover](/interactions/hover), [NgpFocusVisible](/interactions/focus-visible), [NgpPress](/interactions/press)

<response-field name="ngpSwitchChecked" type="boolean" default="false">
  Define the checked state.
</response-field>

<response-field name="ngpSwitchDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

<response-field name="ngpSwitchCheckedChange" type="boolean">
  Event emitted when the state changes.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpSwitch` directive:

| Attribute            | Description              | Value             |
| -------------------- | ------------------------ | ----------------- |
| `data-checked`       | The state of the switch. | `true` \| `false` |
| `data-disabled`      | The disabled state.      | `true` \| `false` |
| `data-hover`         | The hover state.         | `true` \| `false` |
| `data-focus-visible` | The focus state.         | `true` \| `false` |
| `data-press`         | The pressed state.       | `true` \| `false` |

### NgpSwitchThumb

Apply the `ngpSwitchThumb` directive to an element within a switch to represent the thumb.

- Selector: `[ngpSwitchThumb]`
- Exported As: `ngpSwitchThumb`
- Host Directives: [NgpHover](/interactions/hover), [NgpFocusVisible](/interactions/focus-visible), [NgpPress](/interactions/press)

#### Data Attributes

The following data attributes are available to style the thumb:

| Attribute            | Description              | Value             |
| -------------------- | ------------------------ | ----------------- |
| `data-checked`       | The state of the switch. | `true` \| `false` |
| `data-disabled`      | The disabled state.      | `true` \| `false` |
| `data-hover`         | The hover state.         | `true` \| `false` |
| `data-focus-visible` | The focus state.         | `true` \| `false` |
| `data-press`         | The pressed state.       | `true` \| `false` |

## Accessibility

Adheres to the [WAI-ARIA switch design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).

### Keyboard Interactions

- <kbd>Space</kbd> - Toggle the switch state.
- <kbd>Enter</kbd> - Toggle the switch state.
