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

## Reusable Component

Create a toast component that uses the `NgpToast` directive.

<docs-snippet name="toast"></docs-snippet>

## Global Configuration

You can configure the default options for all toasts in your application using the `provideToastConfig` function in a providers array. This is the recommended way to set duration, position, gravity, gap, and width globally:

```ts
import { provideToastConfig } from 'ng-primitives/toast';

bootstrapApplication(AppComponent, {
  providers: [
    provideToastConfig({
      duration: 5000, // how long the toast is visible (ms)
      position: 'center', // 'start' | 'center' | 'end'
      gravity: 'top',     // 'top' | 'bottom'
      stopOnHover: false,
      ariaLive: 'assertive',
      gap: 16,
      width: '400px',     // default width (set to undefined for responsive CSS)
    }),
  ],
});
```

- To use **responsive width** (controlled by your CSS), simply do not set the `width` property in the config.
- If you want a fixed width for all toasts, set `width` to a pixel or percent value (e.g., `'400px'`).

## Schematics

Generate a reusable toast component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive toast
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/toast` package:

### NgpToast

<api-docs name="NgpToast"></api-docs>

#### Data Attributes

The following data attributes are applied to the first child of the `ngpToast` ng-template:

| Attribute       | Description                     | Value                        |
| --------------- | ------------------------------- | ---------------------------- |
| `data-toast`    | The visible state of the toast. | `visible` \| `hidden`        |
| `data-position` | The position of the toast.      | `start` \| `center` \| `end` |
| `data-gravity`  | The gravity of the toast.       | `top` \| `bottom`            |

## Global Configuration

You can configure the default options for all toasts in your application by using the `provideToastConfig` function in a providers array.

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

<prop-details name="duration" type="number" default="3000">
  The duration in milliseconds that the toast will be visible.
</prop-details>

<prop-details name="position" type="start | center | end" default="end">
  The position of the toast.
</prop-details>

<prop-details name="gravity" type="top | bottom" default="top">
  The gravity of the toast. This will determine the location the toast will slide in and out.
</prop-details>

<prop-details name="stopOnHover" type="boolean" default="true">
  Whether the toast should stop the timer when hovered over. Once the mouse leaves the toast, the timer will restart.
</prop-details>

<prop-details name="ariaLive" type="assertive | polite" default="polite">
  The `aria-live` attribute value for the toast. This will determine how the toast will be read by screen readers.
</prop-details>

<prop-details name="gap" type="number" default="16">
  The gap between each toast.
</prop-details>
