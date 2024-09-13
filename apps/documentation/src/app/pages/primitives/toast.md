---
name: 'Toast'
---

# Toast

A toast is a non-modal, unobtrusive window element used to display brief, auto-expiring messages to the user.

<docs-example name="toast"></docs-example>

## Import

Import the Toast primitives from `ng-primitives/toast`.

```ts
import { NgpToast } from 'ng-primitives/toast';
```

## Usage

Assemble the toast directives in your template.

```html
<button (click)="toast.show()">Show Toast</button>

<ng-template ngpToast #toast="ngpToast">
  <div>...</div>
</ng-template>
```

To show a toast, call the `show` method on the `ngpToast` directive.

## API Reference

The following directives are available to import from the `ng-primitives/toast` package:

<response-field name="ngpToastDuration" type="number" default="3000">
  The duration in milliseconds that the toast will be visible.
</response-field>

<response-field name="ngpToastPosition" type="start | center | end" default="end">
  The position of the toast.
</response-field>

<response-field name="ngpToastGravity" type="top | bottom" default="top">
  The gravity of the toast. This will determine the location the toast will slide in and out.
</response-field>

<response-field name="ngpToastStopOnHover" type="boolean" default="true">
  Whether the toast should stop the timer when hovered over. Once the mouse leaves the toast, the timer will restart.
</response-field>

<response-field name="ngpToastAriaLive" type="assertive | polite" default="polite">
  The `aria-live` attribute value for the toast. This will determine how the toast will be read by screen readers.
</response-field>

### NgpToast

- Selector: `[ngpToast]`
- Exported As: `ngpToast`

#### Data Attributes

The following data attributes are applied to the first child of the `ngpToast` ng-template:

| Attribute       | Description                     | Value                        |
| --------------- | ------------------------------- | ---------------------------- |
| `data-toast`    | The visible state of the toast. | `visible` \| `hidden`        |
| `data-position` | The position of the toast.      | `start` \| `center` \| `end` |
| `data-gravity`  | The gravity of the toast.       | `top` \| `bottom`            |

## Global Configuration

You can configure the default options for all toasts in your application by using the `provideNgpToastConfig` function in a providers array.

```ts
import { provideToastConfig } from 'ng-primitives/toast';

bootstrapApplication(AppComponent, {
  providers: [
    provideToastConfig({
      duration: 5000,
      position: 'center',
      gravity: 'top',
      stopOnHover: false,
      ariaLive: 'assertive',
      gap: 16,
    }),
  ],
});
```

### NgpToastConfig

<response-field name="duration" type="number" default="3000">
  The duration in milliseconds that the toast will be visible.
</response-field>

<response-field name="position" type="start | center | end" default="end">
  The position of the toast.
</response-field>

<response-field name="gravity" type="top | bottom" default="top">
  The gravity of the toast. This will determine the location the toast will slide in and out.
</response-field>

<response-field name="stopOnHover" type="boolean" default="true">
  Whether the toast should stop the timer when hovered over. Once the mouse leaves the toast, the timer will restart.
</response-field>

<response-field name="ariaLive" type="assertive | polite" default="polite">
  The `aria-live` attribute value for the toast. This will determine how the toast will be read by screen readers.
</response-field>

<response-field name="gap" type="number" default="16">
  The gap between each toast.
</response-field>
