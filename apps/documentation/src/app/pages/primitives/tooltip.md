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

<api-docs name="NgpTooltip"></api-docs>

### NgpTooltipTrigger

<api-docs name="NgpTooltipTrigger"></api-docs>

#### Data Attributes

| Attribute       | Description                           |
| --------------- | ------------------------------------- |
| `data-open`     | Applied when the popover is open.     |
| `data-disabled` | Applied when the tooltip is disabled. |

## Animations

The `ngpTooltip` primitive adds a CSS custom property `--ngp-tooltip-transform-origin` to the element that can be used to animate the tooltip from the trigger element.

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
