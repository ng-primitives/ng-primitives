---
name: 'Popover'
---

# Popover

Display arbitrary content inside floating panels.

<docs-example name="popover"></docs-example>

## Import

Import the Popover primitives from `ng-primitives/popover`.

```ts
import { NgpPopover } from 'ng-primitives/popover';
```

## Usage

Assemble the popover directives in your template.

```html
<button [ngpPopoverTrigger]="popover">Click me</button>

<ng-template #popover>
  <div ngpPopover>Popover content</div>
</ng-template>
```

## API Reference

The following directives are available to import from the `ng-primitives/popover` package:

### NgpPopover

Apply the `ngpPopover` directive to an element that represents the popover. This typically would be a `div` inside an `ng-template`.

- Selector: `[ngpPopover]`
- Exported As: `ngpPopover`

### NgpPopoverTrigger

Apply the `ngpPopoverTrigger` directive to an element that triggers the popover to show.

- Selector: `[ngpPopoverTrigger]`
- Exported As: `ngpPopoverTrigger`

<prop-details name="ngpPopoverTrigger" type="TemplateRef">
  Define the content of the popover. This should be reference to an `ng-template`.
</prop-details>

<prop-details name="ngpPopoverTriggerOpen" type="boolean" default="false">
  Define the open state.
</prop-details>

<prop-details name="ngpPopoverTriggerOpenChange"  type="boolean">
  Event emitted when the state changes.
</prop-details>

<prop-details name="ngpPopoverTriggerOffset" type="number" default="0">
  Define the offset from the trigger element.
</prop-details>

<prop-details name="ngpPopoverTriggerDisabled" type="boolean" default="false">
  Define the disabled state.
</prop-details>

<prop-details name="ngpPopoverTriggerPlacement" type="'top' | 'right' | 'bottom' | 'left'" default="bottom">
  Define the placement of the popover.
</prop-details>

<prop-details name="ngpPopoverTriggerShowDelay" type="number" default="0">
  Define the delay before the popover shows.
</prop-details>

<prop-details name="ngpPopoverTriggerHideDelay" type="number" default="0">
  Define the delay before the popover hides.
</prop-details>

<prop-details name="ngpPopoverTriggerFlip" type="boolean" default="true">
  Define if the popover should flip when it reaches the edge of the viewport.
</prop-details>

<prop-details name="ngpPopoverTriggerContainer" type="HTMLElement">
  Define the container element for the popover. This is the document body by default.
</prop-details>

<prop-details name="ngpPopoverTriggerCloseOnOutsideClick" type="boolean" default="true">
  Define whether the popover should close when clicking outside of it.
</prop-details>

<prop-details name="ngpPopoverTriggerScrollBehavior" type="reposition | block" default="reposition">
Defines how the popover behaves when the window is scrolled. If set to `reposition`, the popover will adjust its position automatically during scrolling. Make sure the popover uses `position: absolute` in this mode. If set to `block`, scrolling will be disabled while the popover is open. In this case, the popover should use `position: fixed`.
</prop-details>

#### Data Attributes

| Attribute       | Description                           |
| --------------- | ------------------------------------- |
| `data-open`     | Applied when the popover is open.     |
| `data-disabled` | Applied when the popover is disabled. |

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
