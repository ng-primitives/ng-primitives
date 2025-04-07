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

<response-field name="ngpPopoverTrigger" type="TemplateRef">
  Define the content of the popover. This should be reference to an `ng-template`.
</response-field>

<response-field name="ngpPopoverTriggerOpen" type="boolean" default="false">
  Define the open state.
</response-field>

<response-field name="ngpPopoverTriggerOpenChange"  type="boolean">
  Event emitted when the state changes.
</response-field>

<response-field name="ngpPopoverTriggerOffset" type="number" default="0">
  Define the offset from the trigger element.
</response-field>

<response-field name="ngpPopoverTriggerDisabled" type="boolean" default="false">
  Define the disabled state.
</response-field>

<response-field name="ngpPopoverTriggerPlacement" type="'top' | 'right' | 'bottom' | 'left'" default="bottom">
  Define the placement of the popover.
</response-field>

<response-field name="ngpPopoverTriggerShowDelay" type="number" default="0">
  Define the delay before the popover shows.
</response-field>

<response-field name="ngpPopoverTriggerHideDelay" type="number" default="0">
  Define the delay before the popover hides.
</response-field>

<response-field name="ngpPopoverTriggerFlip" type="boolean" default="true">
  Define if the popover should flip when it reaches the edge of the viewport.
</response-field>

<response-field name="ngpPopoverTriggerContainer" type="HTMLElement">
  Define the container element for the popover. This is the document body by default.
</response-field>

<response-field name="ngpPopoverTriggerCloseOnOutsideClick" type="boolean" default="true">
  Define whether the popover should close when clicking outside of it.
</response-field>

<response-field name="ngpPopoverTriggerScrollBehavior" type="reposition | block" default="reposition">
Defines how the popover behaves when the window is scrolled. If set to `reposition`, the popover will adjust its position automatically during scrolling. Make sure the popover uses `position: absolute` in this mode. If set to `block`, scrolling will be disabled while the popover is open. In this case, the popover should use `position: fixed`.
</response-field>

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

<response-field name="offset" type="number">
  Define the offset from the trigger element.
</response-field>

<response-field name="placement" type="'top' | 'right' | 'bottom' | 'left'">
  Define the placement of the popover.
</response-field>

<response-field name="showDelay" type="number">
  Define the delay before the popover shows.
</response-field>

<response-field name="hideDelay" type="number">
  Define the delay before the popover hides.
</response-field>

<response-field name="flip" type="boolean">
  Define if the popover should flip when it reaches the edge of the viewport.
</response-field>

<response-field name="container" type="HTMLElement">
  Define the container element for the popover. This is the document body by default.
</response-field>

<response-field name="closeOnOutsideClick" type="boolean">
  Define whether the popover should close when clicking outside of it.
</response-field>

<response-field name="scrollBehavior" type="reposition | block">
Defines how the popover behaves when the window is scrolled. If set to `reposition`, the popover will adjust its position automatically during scrolling. Make sure the popover uses `position: absolute` in this mode. If set to `block`, scrolling will be disabled while the popover is open. In this case, the popover should use `position: fixed`.
</response-field>
