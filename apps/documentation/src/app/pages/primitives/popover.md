---
name: 'Popover'
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
<button [ngpPopoverTrigger]="popover">Click me</button>

<ng-template #popover>
  <div ngpPopover>Popover content</div>
</ng-template>
```

## Reusable Component

Create a popover component that uses the `NgpPopover` directive.

<docs-snippet name="popover"></docs-snippet>

## API Reference

The following directives are available to import from the `ng-primitives/popover` package:

### NgpPopover

<api-docs name="NgpPopover"></api-docs>

#### Data Attributes

| Attribute        | Description                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| `data-enter`     | Applied when the popover is being added to the DOM. This can be used to trigger animations.     |
| `data-exit`      | Applied when the popover is being removed from the DOM. This can be used to trigger animations. |
| `data-placement` | The final rendered placement of the popover.                                                    |

The following CSS custom properties are applied to the `ngpPopover` directive:

| Property                         | Description                                         |
| -------------------------------- | --------------------------------------------------- |
| `--ngp-popover-transform-origin` | The transform origin of the popover for animations. |
| `--ngp-popover-trigger-width`    | The width of the trigger element.                   |

### NgpPopoverTrigger

<api-docs name="NgpPopoverTrigger"></api-docs>

#### Data Attributes

| Attribute       | Description                           |
| --------------- | ------------------------------------- |
| `data-open`     | Applied when the popover is open.     |
| `data-disabled` | Applied when the popover is disabled. |

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

### Data Attributes

| Attribute        | Description                                  |
| ---------------- | -------------------------------------------- |
| `data-placement` | The final rendered placement of the popover. |

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
    }),
  ],
});
```

### NgpPopoverConfig

<prop-details name="offset" type="number">
  Define the offset from the trigger element.
</prop-details>

<prop-details name="placement" type="'top' | 'right' | 'bottom' | 'left'">
  Define the placement of the popover.
</prop-details>

<prop-details name="showDelay" type="number">
  Define the delay before the popover shows.
</prop-details>

<prop-details name="hideDelay" type="number">
  Define the delay before the popover hides.
</prop-details>

<prop-details name="flip" type="boolean">
  Define if the popover should flip when it reaches the edge of the viewport.
</prop-details>

<prop-details name="container" type="HTMLElement">
  Define the container element for the popover. This is the document body by default.
</prop-details>

<prop-details name="closeOnOutsideClick" type="boolean">
  Define whether the popover should close when clicking outside of it.
</prop-details>

<prop-details name="scrollBehavior" type="reposition | block">
Defines how the popover behaves when the window is scrolled. If set to `reposition`, the popover will adjust its position automatically during scrolling. Make sure the popover uses `position: absolute` in this mode. If set to `block`, scrolling will be disabled while the popover is open. In this case, the popover should use `position: fixed`.
</prop-details>
