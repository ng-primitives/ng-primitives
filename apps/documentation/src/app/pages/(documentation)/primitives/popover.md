---
title: Popover | Angular Primitives
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

## Reusable Component

Create a popover component that uses the `NgpPopover` directive.

<docs-snippet name="popover"></docs-snippet>

## Schematics

Generate a reusable popover component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive popover
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `styles`: How component styles should be generated. `css` (default) includes the full example styles; `unstyled` omits them entirely so you can style the component yourself.
- `example-styles` (deprecated): still supported for compatibility - `true` maps to `styles: css`, `false` maps to `styles: unstyled`.

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

### Overflow Boundary

By default, the popover is kept within the viewport and its clipping ancestors. Pass `boundary` or `rootBoundary` to `flip` or `shift` to measure overflow against something else:

```html
<!-- Keep the popover inside a container element -->
<div #boundary>
  <button [ngpPopoverTrigger]="popover" [ngpPopoverTriggerFlip]="{boundary: boundary}">
    Popover constrained to a container
  </button>
</div>

<!-- Keep the popover inside whatever scrolls the trigger -->
<div style="overflow: auto">
  <button [ngpPopoverTrigger]="popover" [ngpPopoverTriggerFlip]="{altBoundary: true}">
    Popover constrained to the trigger's scroll container
  </button>
</div>

<!-- Measure against the whole document rather than the viewport -->
<button [ngpPopoverTrigger]="popover" [ngpPopoverTriggerFlip]="{rootBoundary: 'document'}">
  Popover that does not flip while off-screen
</button>
```

`altBoundary` measures against the trigger's clipping ancestors rather than the popover's. The popover is portalled to the body, so its own clipping ancestors are effectively the viewport - set this when the trigger sits in a scroll container. It applies only while `boundary` is left at its default; an explicit boundary always wins.

`crossAxis` widens the axis each option checks. For `flip` it is the alignment axis, on by default - that is how `bottom-end` becomes `bottom-start` near an edge. For `shift` it is the side axis, off by default; enabling it lets the panel move along the placement direction too:

```html
<button [ngpPopoverTrigger]="popover" [ngpPopoverTriggerFlip]="{crossAxis: false}">
  Keep the alignment
</button>
<button [ngpPopoverTrigger]="popover" [ngpPopoverTriggerShift]="{crossAxis: true}">
  Shift on both axes
</button>
```

The `--ngp-popover-available-width` and `--ngp-popover-available-height` custom properties are measured against the flip boundary, or the shift boundary when flip does not set one.

### Popover with anchor

The popover can be anchored to a different element than the trigger.

<docs-example name="popover-anchor"></docs-example>

The anchor is live - rebinding it moves an already-open popover to the new element, and it is the new element that counts as inside for dismissal.

### Dismiss Guard

Use dismiss guards to prevent a popover from closing when there are unsaved changes. The `closeOnOutsideClick` and `closeOnEscape` options accept a guard function that returns a boolean or a `Promise<boolean>`.

<docs-example name="popover-dismiss-guard"></docs-example>

### Controlled

Bind `ngpPopoverTriggerOpen` to own the open state - to open the popover from somewhere else, restore it from the URL, or keep it open while work it started is in flight. With `[(ngpPopoverTriggerOpen)]` the binding follows every open and close.

<docs-example name="popover-controlled"></docs-example>

While it is bound, the binding decides. A click on the trigger, Escape or an outside press emits `ngpPopoverTriggerOpenChange` and the popover waits for the binding to change, so a value you do not update keeps it as it is. A change you make to the binding opens or closes it with the usual animations, skips the show and hide delays, and is not emitted back. Calls to `show()` and `hide()`, and a listbox closing its popover on select, are requests too. A few closes cannot wait for the binding - the trigger being hidden, the content being cleared, a parent overlay closing - and are emitted as they happen, so a binding you do not update from `ngpPopoverTriggerOpenChange` can be left `true` on a closed popover.

Use `ngpPopoverTriggerDefaultOpen` instead to open an unbound popover on first render.

### Handling Escape inside the popover

Overlays handle Escape before the controls inside them, so stopping the event in a control is too late. A control that uses Escape itself, such as an inline-edit field that reverts its value, claims the key with `claimEscapeKey` from `ng-primitives/portal`. Call it in an injection context; the claim is released when that context is destroyed. A claimed Escape pressed inside the topmost overlay leaves it open. Compare against `event.composedPath()[0]` rather than `event.target`, which is retargeted to the shadow host when the overlay renders inside a shadow root.

```ts
import { ElementRef, signal, viewChild } from '@angular/core';
import { claimEscapeKey } from 'ng-primitives/portal';

export class InlineEdit {
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  // true while the value is being edited; Escape then reverts it instead of closing the popover
  readonly editing = signal(false);

  constructor() {
    claimEscapeKey(
      event => this.editing() && event.composedPath()[0] === this.field()?.nativeElement,
    );
  }
}
```

### Keeping Content Mounted

By default, the popover content is destroyed when the popover closes and created again on the next open, so any one-time setup runs every time. Set `ngpPopoverTriggerKeepMounted` to keep the content instance alive between opens instead.

<docs-example name="popover-keep-mounted"></docs-example>

The content is still removed from the DOM while the popover is closed, so nothing is left rendered behind the scenes. What survives is the component instance and its DOM nodes: the content is not re-instantiated, so one-time work (such as a network request) is not repeated and unsaved state (such as a partly filled form or a scroll position) is preserved.

Two things to weigh before enabling it:

- The kept-alive view stays attached to change detection while the popover is hidden, so its bindings continue to be checked.
- The instance lives until the trigger itself is destroyed, or until the `ngpPopoverTrigger` content changes, so anything expensive it holds on to stays in memory.

### Final focus

When the popover closes, focus returns to the element that was focused when it opened, usually its trigger. Set `ngpPopoverFinalFocus` to choose another element, to `false` to leave focus where it is, or to a function that receives the close origin and returns one of these.

```html
<button [ngpPopoverTrigger]="popover">Rename</button>
<input #search />

<ng-template #popover>
  <div ngpPopover [ngpPopoverFinalFocus]="search">...</div>
</ng-template>
```

## API Reference

The following directives are available to import from the `ng-primitives/popover` package:

### NgpPopover

<api-docs name="NgpPopover"></api-docs>

<api-reference-props name="NgpPopover"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-enter" description="Applied when the popover is being added to the DOM. This can be used to trigger animations." />
  <api-attribute name="data-exit" description="Applied when the popover is being removed from the DOM. This can be used to trigger animations." />
  <api-attribute name="data-placement" description="The final rendered placement of the popover." />
  <api-attribute name="data-reference-hidden" description="Applied while the element the popover is positioned against is scrolled or clipped out of view." />
</api-reference-attributes>

<api-reference-css-vars>
  <api-css-var name="--ngp-popover-transform-origin" description="The transform origin of the popover for animations." />
  <api-css-var name="--ngp-popover-trigger-width" description="The width of the trigger element." />
  <api-css-var name="--ngp-popover-available-width" description="The available width of the popover before it overflows the flip boundary, or the shift boundary when flip does not set one. Defaults to the viewport." />
  <api-css-var name="--ngp-popover-available-height" description="The available height of the popover before it overflows the flip boundary, or the shift boundary when flip does not set one. Defaults to the viewport." />
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

With the default `reposition` scroll behavior, the popover follows its reference element (the anchor, or the trigger when no anchor is set) even once that element is scrolled out of view. `data-reference-hidden` is applied while that is the case, so you can show that the popover has lost its reference, for example by fading it:

```css
[ngpPopover][data-reference-hidden] {
  opacity: 0.4;
}
```

Don't hide an open popover with `visibility: hidden` or `display: none`: it still traps focus, so a keyboard user would be stuck in content they cannot see. To dismiss the popover when the page scrolls, set `ngpPopoverTriggerScrollBehavior="close"`.

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
      keepMounted: false,
    }),
  ],
});
```

### NgpPopoverConfig

<api-reference-config name="NgpPopoverConfig"></api-reference-config>

## Accessibility

The popover element is assigned `role="dialog"` and the trigger element uses `aria-expanded` to indicate the popover's open state. The trigger is linked to the popover via `aria-describedby`, and the popover is named by its trigger through `aria-labelledby` unless an `aria-label` or `aria-labelledby` is present when the overlay renders; labels added later do not override the trigger name. Focus is trapped within the popover when open. When it closes, focus returns to the element that was focused when it opened, usually the trigger. An outside click on another control moves focus to that control, and focus the user already moved elsewhere stays there. `ngpPopoverFinalFocus` can choose another target, or `false` to leave focus where it is.

Add `autofocus` to one or more usable elements to focus the first one when the popover opens; otherwise the first tabbable element is focused, or the popover itself if there is none. If focus is already inside the popover when it opens, it stays there and `autofocus` is ignored.

### Keyboard Interactions

- <kbd>Enter</kbd> / <kbd>Space</kbd>: Toggle the popover.
- <kbd>Esc</kbd>: Close the popover.
- <kbd>Tab</kbd>: Navigate through focusable elements within the popover.
- <kbd>Shift</kbd> + <kbd>Tab</kbd>: Navigate backwards through focusable elements within the popover.
