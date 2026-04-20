---
name: 'Popover'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/popover'
---

# Popover

Display arbitrary content inside floating panels.

<docs-example name="popover"></docs-example>

## Import

Import the Popover primitives from `ng-primitives/popover`.

```ts
import { NgpPopover, NgpPopoverTrigger, NgpPopoverArrow } from 'ng-primitives/popover';
```

## Usage

Assemble the popover directives in your template.

```html
<button [ngpPopoverTrigger]="popover" (ngpPopoverTriggerOpenChange)="onPopoverStateChange($event)">
  Click me
</button>

<ng-template #popover>
  <div ngpPopover>Popover content</div>
</ng-template>
```

You can listen to the `ngpPopoverTriggerOpenChange` event to perform actions when the popover state changes. The event emits a boolean value indicating whether the popover is open or closed:

## Examples

### Custom Offset

You can customize the offset using either a simple number or an object for more precise control:

```html
<!-- Simple number offset -->
<button [ngpPopoverTrigger]="popover" ngpPopoverTriggerOffset="12">Popover with 12px offset</button>

<!-- Object offset for precise control -->
<button
  [ngpPopoverTrigger]="popover"
  [ngpPopoverTriggerOffset]="{mainAxis: 8, crossAxis: 4, alignmentAxis: 2}"
>
  Popover with custom offset
</button>
```

### Custom Shift

You can customize the shift behavior to control how the popover stays within the viewport:

```html
<!-- Disable shift -->
<button [ngpPopoverTrigger]="popover" [ngpPopoverTriggerShift]="false">
  Popover without shift
</button>

<!-- Object shift for precise control -->
<button [ngpPopoverTrigger]="popover" [ngpPopoverTriggerShift]="{padding: 8}">
  Popover with custom shift padding
</button>
```

## Reusable Component

Create a popover component that uses the `NgpPopover` directive.

<docs-snippet name="popover"></docs-snippet>

## Schematics

Generate a reusable tooltip component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive popover
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`

## Examples

### Popover with anchor

The popover can be anchored to a different element than the trigger.

<docs-example name="popover-anchor"></docs-example>

### Dismiss Guard

Use dismiss guards to prevent a popover from closing when there are unsaved changes. The `closeOnOutsideClick` and `closeOnEscape` options accept a guard function that returns a boolean or a `Promise<boolean>`.

<docs-example name="popover-dismiss-guard"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/popover` package:

### NgpPopover

<api-docs name="NgpPopover"></api-docs>

<api-reference-props name="NgpPopover"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-enter" description="Applied when the popover is being added to the DOM. This can be used to trigger animations." />
  <api-attribute name="data-exit" description="Applied when the popover is being removed from the DOM. This can be used to trigger animations." />
  <api-attribute name="data-placement" description="The final rendered placement of the popover." />
</api-reference-attributes>

<api-reference-css-vars>
  <api-css-var name="--ngp-popover-transform-origin" description="The transform origin of the popover for animations." />
  <api-css-var name="--ngp-popover-trigger-width" description="The width of the trigger element." />
  <api-css-var name="--ngp-popover-available-width" description="The available width of the popover before it overflows the viewport." />
  <api-css-var name="--ngp-popover-available-height" description="The available height of the popover before it overflows the viewport." />
</api-reference-css-vars>

### NgpPopoverTrigger

<api-docs name="NgpPopoverTrigger"></api-docs>

<api-reference-props name="NgpPopoverTrigger"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the popover is open." />
  <api-attribute name="data-disabled" description="Applied when the popover is disabled." />
</api-reference-attributes>

### NgpPopoverArrow

The `NgpPopoverArrow` directive is used to add an arrow to the popover. It should be placed inside the popover content. It will receive `inset-inline-start` or `inset-block-start` styles to position the arrow based on the popover's placement. As a result it should be positioned absolutely within the popover content.

The arrow can be styled conditionally based on the popover's final placement using the `data-placement` attribute:

```css
[ngpPopoverArrow][data-placement='top'] {
  /* Arrow styles when popover is positioned on top */
}

[ngpPopoverArrow][data-placement='bottom'] {
  /* Arrow styles when popover is positioned on bottom */
}
```

<api-docs name="NgpPopoverArrow"></api-docs>

<api-reference-props name="NgpPopoverArrow"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-placement" description="The final rendered placement of the popover." />
</api-reference-attributes>

## Styling

For the popover to be positioned correctly relative to the trigger element, it must use absolute or fixed positioning. For example, you can use the following CSS:

```css
[ngpPopover] {
  position: absolute;
}
```

## Animations

The `ngpPopover` primitive adds a CSS custom property `--ngp-popover-transform-origin` to the element that can be used to animate the popover from the trigger element.

The `ngpPopover` will also add the `data-enter` and `data-exit` attributes to the element when it is being added or removed from the DOM. This can be used to trigger animations.

```css
:host[data-enter] {
  animation: fade-in 0.2s ease-in-out;
}

:host[data-exit] {
  animation: fade-out 0.2s ease-in-out;
}
```

## Global Configuration

You can configure the default options for all popovers in your application by using the `providePopoverConfig` function in a providers array.

```ts
import { providePopoverConfig } from 'ng-primitives/popover';

bootstrapApplication(AppComponent, {
  providers: [
    providePopoverConfig({
      offset: 4,
      placement: 'top',
      showDelay: 0,
      hideDelay: 0,
      flip: true,
      container: document.body,
      closeOnOutsideClick: true,
      scrollBehavior: 'reposition',
      cooldown: 0,
    }),
  ],
});
```

### NgpPopoverConfig

<api-reference-config name="NgpPopoverConfig"></api-reference-config>

## Accessibility

The popover element is assigned `role="dialog"` and the trigger element uses `aria-expanded` to indicate the popover's open state. The trigger is linked to the popover via `aria-describedby`. Focus is trapped within the popover when open.

### Keyboard Interactions

- <kbd>Enter</kbd> / <kbd>Space</kbd>: Toggle the popover.
- <kbd>Esc</kbd>: Close the popover.
- <kbd>Tab</kbd>: Navigate through focusable elements within the popover.
- <kbd>Shift</kbd> + <kbd>Tab</kbd>: Navigate backwards through focusable elements within the popover.
