---
name: 'Tooltip'
---

# Tooltip

Display additional information on hover.

<docs-example name="tooltip"></docs-example>

## Import

Import the Tooltip primitives from `ng-primitives/tooltip`.

```ts
import { NgpTooltip, NgpTooltipTrigger, NgpTooltipArrow } from 'ng-primitives/tooltip';
```

## Usage

Assemble the tooltip directives in your template.

```html
<button [ngpTooltipTrigger]="tooltip" ngpButton>Hover me</button>

<ng-template #tooltip>
  <div ngpTooltip>Tooltip content</div>
</ng-template>
```

## Reusable Component

Create a tooltip component that uses the `NgpTooltip` directive.

<docs-snippet name="tooltip"></docs-snippet>

## Schematics

Generate a reusable tooltip component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive tooltip
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/tooltip` package:

### NgpTooltip

<api-docs name="NgpTooltip"></api-docs>

#### Data Attributes

| Attribute    | Description                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------- |
| `data-enter` | Applied when the tooltip is being added to the DOM. This can be used to trigger animations.     |
| `data-exit`  | Applied when the tooltip is being removed from the DOM. This can be used to trigger animations. |

The following CSS custom properties are applied to the `ngpTooltip` directive:

| Property                         | Description                                         |
| -------------------------------- | --------------------------------------------------- |
| `--ngp-tooltip-transform-origin` | The transform origin of the tooltip for animations. |
| `--ngp-tooltip-trigger-width`    | The width of the trigger element.                   |

### NgpTooltipTrigger

<api-docs name="NgpTooltipTrigger"></api-docs>

#### Data Attributes

| Attribute       | Description                           |
| --------------- | ------------------------------------- |
| `data-open`     | Applied when the tooltip is open.     |
| `data-disabled` | Applied when the tooltip is disabled. |

### NgpTooltipArrow

The `NgpTooltipArrow` directive is used to add an arrow to the tooltip. It should be placed inside the tooltip content. It will receive `inset-inline-start` or `inset-block-start` styles to position the arrow based on the tooltip's placement. As a result it should be positioned absolutely within the tooltip content.

<api-docs name="NgpTooltipArrow"></api-docs>

## Styling

For the tooltip to be positioned correctly relative to the trigger element, it must use absolute or fixed positioning. For example, you can use the following CSS:

```css
[ngpTooltip] {
  position: absolute;
}
```

## Animations

The `ngpTooltip` primitive adds a CSS custom property `--ngp-tooltip-transform-origin` to the element that can be used to animate the tooltip from the trigger element.

The `ngpTooltip` will also add the `data-enter` and `data-exit` attributes to the element when it is being added or removed from the DOM. This can be used to trigger animations.

```css
:host[data-enter] {
  animation: fade-in 0.2s ease-in-out;
}

:host[data-exit] {
  animation: fade-out 0.2s ease-in-out;
}
```

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
