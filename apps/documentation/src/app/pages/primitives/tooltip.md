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

<response-field name="ngpTooltipTrigger" type="TemplateRef">
  Define the content of the tooltip. This should be reference to an `ng-template`.
</response-field>

<response-field name="ngpTooltipTriggerOpen" type="boolean" default="false">
  Define the open state.
</response-field>

<response-field name="ngpTooltipTriggerOpenChange"  type="boolean">
  Event emitted when the state changes.
</response-field>

<response-field name="ngpTooltipTriggerOffset" type="number" default="0">
  Define the offset from the trigger element.
</response-field>

<response-field name="ngpTooltipTriggerDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

<response-field name="ngpTooltipTriggerPlacement" type="'top' | 'right' | 'bottom' | 'left'" default="top">
  Define the placement of the tooltip.
</response-field>

<response-field name="ngpTooltipTriggerShowDelay" type="number" default="0">
  Define the delay before the tooltip shows.
</response-field>

<response-field name="ngpTooltipTriggerHideDelay" type="number" default="0">
  Define the delay before the tooltip hides.
</response-field>

<response-field name="ngpTooltipTriggerFlip" type="boolean" default="true">
  Define if the tooltip should flip when it reaches the edge of the viewport.
</response-field>

<response-field name="ngpTooltipTriggerContainer" type="HTMLElement">
  Define the container element for the tooltip. This is the document body by default.
</response-field>

#### Data Attributes

| Attribute       | Description                           | Value                                        |
| --------------- | ------------------------------------- | -------------------------------------------- |
| `data-state`    | The state of the tooltip.             | `closed` \| `closing` \| `open` \| `opening` |
| `data-disabled` | Applied when the tooltip is disabled. | `-`                                          |

## Global Configuration

You can configure the default options for all tooltips in your application by using the `provideNgpTooltipConfig` function in a providers array.

```ts
import { provideNgpTooltipConfig } from 'ng-primitives/tooltip';

bootstrapApplication(AppComponent, {
  providers: [
    provideNgpTooltipConfig({
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

<response-field name="offset" type="number">
  Define the offset from the trigger element.
</response-field>

<response-field name="placement" type="'top' | 'right' | 'bottom' | 'left'">
  Define the placement of the tooltip.
</response-field>

<response-field name="showDelay" type="number">
  Define the delay before the tooltip shows.
</response-field>

<response-field name="hideDelay" type="number">
  Define the delay before the tooltip hides.
</response-field>

<response-field name="flip" type="boolean">
  Define if the tooltip should flip when it reaches the edge of the viewport.
</response-field>

<response-field name="container" type="HTMLElement">
  Define the container element for the tooltip. This is the document body by default.
</response-field>
