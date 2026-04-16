---
name: 'Tooltip'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/tooltip'
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
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

### Tooltip with Custom Container

The tooltip can be rendered inside a custom container. You can open DevTools and inspect the DOM to see it mounted within this container.

<docs-example name="tooltip-custom-container"></docs-example>

### Cursor-Following Tooltip

You can position a tooltip at specific coordinates using the `ngpTooltipTriggerPosition` input. Combined with `ngpTooltipTriggerTrackPosition`, this enables smooth cursor-following tooltips.

<docs-example name="tooltip-cursor"></docs-example>

### Custom Offset

You can customize the offset using either a simple number or an object for more precise control:

```html
<!-- Simple number offset -->
<button [ngpTooltipTrigger]="tooltip" ngpTooltipTriggerOffset="12">Tooltip with 12px offset</button>

<!-- Object offset for precise control -->
<button
  [ngpTooltipTrigger]="tooltip"
  [ngpTooltipTriggerOffset]="{mainAxis: 8, crossAxis: 4, alignmentAxis: 2}"
>
  Tooltip with custom offset
</button>
```

### Custom Shift

You can customize the shift behavior to control how the tooltip stays within the viewport:

```html
<!-- Disable shift -->
<button [ngpTooltipTrigger]="tooltip" [ngpTooltipTriggerShift]="false">
  Tooltip without shift
</button>

<!-- Object shift for precise control -->
<button [ngpTooltipTrigger]="tooltip" [ngpTooltipTriggerShift]="{padding: 8}">
  Tooltip with custom shift padding
</button>
```

## API Reference

The following directives are available to import from the `ng-primitives/tooltip` package:

### NgpTooltip

<api-docs name="NgpTooltip"></api-docs>

<api-reference-props name="NgpTooltip"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-enter" description="Applied when the tooltip is being added to the DOM. This can be used to trigger animations." />
  <api-attribute name="data-exit" description="Applied when the tooltip is being removed from the DOM. This can be used to trigger animations." />
  <api-attribute name="data-placement" description="The final rendered placement of the tooltip." />
</api-reference-attributes>

<api-reference-css-vars>
  <api-css-var name="--ngp-tooltip-transform-origin" description="The transform origin of the tooltip for animations." />
  <api-css-var name="--ngp-tooltip-trigger-width" description="The width of the trigger element." />
  <api-css-var name="--ngp-tooltip-available-width" description="The available width of the tooltip before it overflows the viewport." />
  <api-css-var name="--ngp-tooltip-available-height" description="The available height of the tooltip before it overflows the viewport." />
</api-reference-css-vars>

### NgpTooltipTrigger

<api-docs name="NgpTooltipTrigger"></api-docs>

<api-reference-props name="NgpTooltipTrigger"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the tooltip is open." />
  <api-attribute name="data-disabled" description="Applied when the tooltip is disabled." />
</api-reference-attributes>

### NgpTooltipArrow

The `NgpTooltipArrow` directive is used to add an arrow to the tooltip. It should be placed inside the tooltip content. It will receive `inset-inline-start` or `inset-block-start` styles to position the arrow based on the tooltip's placement. As a result it should be positioned absolutely within the tooltip content.

The arrow can be styled conditionally based on the tooltip's final placement using the `data-placement` attribute:

```css
[ngpTooltipArrow][data-placement='top'] {
  /* Arrow styles when tooltip is positioned on top */
}

[ngpTooltipArrow][data-placement='bottom'] {
  /* Arrow styles when tooltip is positioned on bottom */
}
```

<api-docs name="NgpTooltipArrow"></api-docs>

<api-reference-props name="NgpTooltipArrow"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-placement" description="The final rendered placement of the tooltip." />
</api-reference-attributes>

## Using Text Content as Tooltip

The `useTextContent` input (enabled by default) allows the tooltip to automatically use the text content of the trigger element as the tooltip content. This is particularly useful for displaying full text when content is truncated with ellipsis.

```html
<!-- Simple usage - uses text content automatically -->
<div class="truncated-text" ngpTooltipTrigger>
  This text might be truncated with ellipsis and show the full content in the tooltip
</div>

<!-- Passing content directly takes precedence -->
<button [ngpTooltipTrigger]="myToolip">This won't show a tooltip unless content is provided</button>
```

### Important: Global Styles Required

When using the `useTextContent` feature or string values, the tooltip styles **must be global** and not encapsulated to the component. This is because the tooltip content is rendered in a portal outside of your component's scope.

```css
/* ✅ Global styles (in styles.css or with ViewEncapsulation.None) */
[ngpTooltip] {
  position: absolute;
  background-color: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
}

/* ❌ Encapsulated styles won't work with useTextContent */
.my-component [ngpTooltip] {
  /* This won't be applied to text content tooltips */
}
```

If you need component-scoped styles, use template-based or component-based tooltips instead of `useTextContent`.

## Conditional Tooltips

The `showOnOverflow` input allows you to show tooltips only when the trigger element has overflowing content. This is particularly useful for text that might be truncated with ellipsis.

```html
<div
  class="truncated-text"
  appTooltipTrigger="This tooltip only shows when text overflows"
  ngpTooltipTriggerShowOnOverflow
>
  This text might be truncated
</div>
```

## Hoverable Tooltip Content

Tooltips keep strict tooltip semantics (`role="tooltip"`) while supporting pointer movement from trigger to tooltip content.

<docs-example name="tooltip-hoverable-content"></docs-example>

Use `ngpTooltipTriggerHoverableContent` to control whether hovering tooltip content keeps it open:

```html
<!-- Default: closes when pointer leaves trigger -->
<button [ngpTooltipTrigger]="tooltip">Default behavior</button>

<!-- Opt in: stays open while pointer moves into tooltip content -->
<button [ngpTooltipTrigger]="tooltip" ngpTooltipTriggerHoverableContent="true">
  Hover bridge enabled
</button>
```

If tooltip content needs to be interactive or focusable, use [`Popover`](/primitives/popover) instead.

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
      hideDelay: 500,
      flip: true,
      container: document.body,
      showOnOverflow: false,
      useTextContent: true,
      scrollBehavior: 'reposition',
      cooldown: 300,
      hoverableContent: false,
    }),
  ],
});
```

### NgpTooltipConfig

<api-reference-config name="NgpTooltipConfig"></api-reference-config>

## Accessibility

The tooltip primitive follows the [WAI-ARIA Tooltip pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/). The tooltip element is assigned `role="tooltip"` and the trigger element is linked to the tooltip via `aria-describedby`.

### Keyboard Interactions

- <kbd>Tab</kbd>: Focus the trigger element to show the tooltip.
- <kbd>Esc</kbd>: Dismiss the tooltip.
