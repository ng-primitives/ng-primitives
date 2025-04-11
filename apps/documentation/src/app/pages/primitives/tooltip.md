---
name: 'Tooltip'
---

# Tooltip

Display additional information on hover.

<docs-example name="tooltip"></docs-example>

## Import

Import the Tooltip primitives from `ng-primitives/tooltip`.

```ts
import { NgpTooltip } from 'ng-primitives/tooltip';
```

## Usage

Assemble the tooltip directives in your template.

```html
<button [ngpTooltipTrigger]="tooltip" ngpButton>Hover me</button>

<ng-template #tooltip>
  <div ngpTooltip>Tooltip content</div>
</ng-template>
```

## API Reference

The following directives are available to import from the `ng-primitives/tooltip` package:

### NgpTooltip

Apply the `ngpTooltip` directive to an element that represents the tooltip. This typically would be a `div` inside an `ng-template`.

- Selector: `[ngpTooltip]`
- Exported As: `ngpTooltip`

### NgpTooltipTrigger

Apply the `ngpTooltipTrigger` directive to an element that triggers the tooltip to show.

- Selector: `[ngpTooltipTrigger]`
- Exported As: `ngpTooltipTrigger`

<prop-details name="ngpTooltipTrigger" type="TemplateRef">
  Define the content of the tooltip. This should be reference to an `ng-template`.
</prop-details>

<prop-details name="ngpTooltipTriggerOpen" type="boolean" default="false">
  Define the open state.
</prop-details>

<prop-details name="ngpTooltipTriggerOpenChange"  type="boolean">
  Event emitted when the state changes.
</prop-details>

<prop-details name="ngpTooltipTriggerOffset" type="number" default="0">
  Define the offset from the trigger element.
</prop-details>

<prop-details name="ngpTooltipTriggerDisabled" type="boolean" default="false">
  Define the disabled state.
</prop-details>

<prop-details name="ngpTooltipTriggerPlacement" type="'top' | 'right' | 'bottom' | 'left'" default="top">
  Define the placement of the tooltip.
</prop-details>

<prop-details name="ngpTooltipTriggerShowDelay" type="number" default="0">
  Define the delay before the tooltip shows.
</prop-details>

<prop-details name="ngpTooltipTriggerHideDelay" type="number" default="0">
  Define the delay before the tooltip hides.
</prop-details>

<prop-details name="ngpTooltipTriggerFlip" type="boolean" default="true">
  Define if the tooltip should flip when it reaches the edge of the viewport.
</prop-details>

<prop-details name="ngpTooltipTriggerContainer" type="HTMLElement">
  Define the container element for the tooltip. This is the document body by default.
</prop-details>

#### Data Attributes

| Attribute       | Description                           |
| --------------- | ------------------------------------- |
| `data-open`     | Applied when the popover is open.     |
| `data-disabled` | Applied when the tooltip is disabled. |

## Global Configuration

You can configure the default options for all tooltips in your application by using the `provideTooltipConfig` function in a providers array.

```ts
import { provideTooltipConfig } from 'ng-primitives/tooltip';

bootstrapApplication(AppComponent, {
  providers: [
    provideTooltipConfig({
      offset: 4,
      placement: 'top',
      showDelay: 0,
      hideDelay: 0,
      flip: true,
      container: document.body,
    }),
  ],
});
```

### NgpTooltipConfig

<prop-details name="offset" type="number">
  Define the offset from the trigger element.
</prop-details>

<prop-details name="placement" type="'top' | 'right' | 'bottom' | 'left'">
  Define the placement of the tooltip.
</prop-details>

<prop-details name="showDelay" type="number">
  Define the delay before the tooltip shows.
</prop-details>

<prop-details name="hideDelay" type="number">
  Define the delay before the tooltip hides.
</prop-details>

<prop-details name="flip" type="boolean">
  Define if the tooltip should flip when it reaches the edge of the viewport.
</prop-details>

<prop-details name="container" type="HTMLElement">
  Define the container element for the tooltip. This is the document body by default.
</prop-details>
