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
<ng-template #toast>
  <div ngpToast>...</div>
</ng-template>
```

To show a toast, inject the `NgpToastManager` service and call the `show` method passing the toast template or a component
class that uses the `NgpToast` directive as a Host Directive.

```ts
import { NgpToastManager } from 'ng-primitives/toast';

export class MyComponent {
  private readonly toastManager = inject(NgpToastManager);

  showToast(): void {
    this.toastManager.show(toastTemplate);
    // or
    this.toastManager.show(MyToastComponent);
  }
}
```

## Reusable Component

Create a toast component that uses the `NgpToast` directive.

<docs-snippet name="toast"></docs-snippet>

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

| Attribute              | Description                                                                                                                              | Value                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `data-position-x`      | The horizontal position of the toast                                                                                                     | `start`, `center`, `end`      |
| `data-position-y`      | The vertical position of the toast                                                                                                       | `top`, `bottom`               |
| `data-visible`         | Whether the toast is currently visible. This is based on how many toasts are shown compared to the `maxToasts` set in the global config. | `true`, `false`               |
| `data-front`           | Whether the toast is the front-most toast in the stack.                                                                                  | `true`, `false`               |
| `data-swiping`         | Whether the toast is currently being swiped.                                                                                             | `true`, `false`               |
| `data-swipe-direction` | The direction of the swipe gesture.                                                                                                      | `left`, `right`, `up`, `down` |
| `data-expanded`        | Whether the toast is currently expanded. This can be used to collapse or expand stacked toasts.                                          | `true`, `false`               |

The following CSS custom properties are available to the `ngpToast` directive:

| Property                     | Description                                   |
| ---------------------------- | --------------------------------------------- |
| `--ngp-toast-gap`            | The gap between each toast.                   |
| `--ngp-toast-z-index`        | The z-index of the toast.                     |
| `--ngp-toasts-before`        | The number of toasts before this one.         |
| `--ngp-toast-index`          | The index of the toast (1-based).             |
| `--ngp-toast-height`         | The height of the toast in pixels.            |
| `--ngp-toast-offset`         | The vertical offset position of the toast.    |
| `--ngp-toast-front-height`   | The height of the front-most toast.           |
| `--ngp-toast-swipe-amount-x` | The swipe amount on the X axis (pixel value). |
| `--ngp-toast-swipe-amount-y` | The swipe amount on the Y axis (pixel value). |
| `--ngp-toast-swipe-x`        | The swipe value on the X axis.                |
| `--ngp-toast-swipe-y`        | The swipe value on the Y axis.                |

## Global Configuration

You can configure the default options for all toasts in your application by using the `provideToastConfig` function in a providers array.

```ts
import { provideToastConfig } from 'ng-primitives/toast';

bootstrapApplication(AppComponent, {
  providers: [
    provideToastConfig({
      placement: 'top-end',
      duration: 5000,
      offsetTop: 16,
      offsetBottom: 16,
      offsetLeft: 16,
      offsetRight: 16,
      dismissible: true,
      maxToasts: 3,
      zIndex: 9999999,
      swipeDirections: ['left', 'right'],
      ariaLive: 'assertive',
      gap: 16,
    }),
  ],
});
```

### NgpToastConfig

<prop-details name="placement" type="NgpToastPlacement" default="top-end">
  The default placement of the toast. Can be one of `top-start`, `top-end`, `top-center`, `bottom-start`, `bottom-end`, or `bottom-center`.
</prop-details>

<prop-details name="duration" type="number" default="3000">
  The duration in milliseconds that the toast will be visible.
</prop-details>

<prop-details name="offsetTop" type="number" default="24">
  The offset from the top of the viewport in pixels.
</prop-details>

<prop-details name="offsetBottom" type="number" default="24">
  The offset from the bottom of the viewport in pixels.
</prop-details>

<prop-details name="offsetLeft" type="number" default="24">
  The offset from the left of the viewport in pixels.
</prop-details>

<prop-details name="offsetRight" type="number" default="24">
  The offset from the right of the viewport in pixels.
</prop-details>

<prop-details name="dismissible" type="boolean" default="true">
  Whether a toast can be dismissed by swiping.
</prop-details>

<prop-details name="swipeThreshold" type="number" default="45">
  The amount a toast must be swiped before it is considered dismissed.
</prop-details>

<prop-details name="swipeDirections" type="NgpToastSwipeDirection[]" default="['left', 'right', 'top', 'bottom']">
  The default swipe directions supported by the toast.
</prop-details>

<prop-details name="maxToasts" type="number" default="3">
  The maximum number of toasts that can be displayed at once.
</prop-details>

<prop-details name="ariaLive" type="string" default="'polite'">
  The aria live setting.
</prop-details>

<prop-details name="gap" type="number" default="14">
  The gap between each toast.
</prop-details>

<prop-details name="zIndex" type="number" default="9999999">
  The z-index of the toast container.
</prop-details>
