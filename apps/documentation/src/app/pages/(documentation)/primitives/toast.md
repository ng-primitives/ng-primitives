---
name: 'Toast'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/toast'
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
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

Here are some additional examples of how to use the Toast primitive.

### Sequential Mode

The sequential mode prevents background toasts from auto-closing. Only the front-most toast's timer runs, and when that toast is dismissed, the timer starts on the next toast in the stack.

This is useful when you have multiple notifications in quick succession (e.g., health monitoring of external services) where you want to ensure users can see all notifications before they auto-close.

<docs-example name="toast-sequential"></docs-example>

You can enable sequential mode in two ways:

**1. Globally via configuration:**

```ts
import { provideToastConfig } from 'ng-primitives/toast';

bootstrapApplication(AppComponent, {
  providers: [
    provideToastConfig({
      sequential: true,
      // ... other config options
    }),
  ],
});
```

**2. Per-toast via the show method:**

```ts
import { NgpToastManager } from 'ng-primitives/toast';

export class MyComponent {
  private readonly toastManager = inject(NgpToastManager);

  showToast(): void {
    this.toastManager.show(ToastComponent, {
      sequential: true,
    });
  }
}
```

## API Reference

The following directives are available to import from the `ng-primitives/toast` package:

### NgpToast

<api-docs name="NgpToast"></api-docs>

<api-reference-props name="NgpToast"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-position-x" description="The horizontal position of the toast" value="start, center, end" />
  <api-attribute name="data-position-y" description="The vertical position of the toast" value="top, bottom" />
  <api-attribute name="data-visible" description="Whether the toast is currently visible. This is based on how many toasts are shown compared to the `maxToasts` set in the global config." value="true, false" />
  <api-attribute name="data-front" description="Whether the toast is the front-most toast in the stack." value="true, false" />
  <api-attribute name="data-swiping" description="Whether the toast is currently being swiped." value="true, false" />
  <api-attribute name="data-swipe-direction" description="The direction of the swipe gesture." value="left, right, up, down" />
  <api-attribute name="data-expanded" description="Whether the toast is currently expanded. This can be used to collapse or expand stacked toasts." value="true, false" />
</api-reference-attributes>

<api-reference-css-vars>
  <api-css-var name="--ngp-toast-gap" description="The gap between each toast." />
  <api-css-var name="--ngp-toast-z-index" description="The z-index of the toast." />
  <api-css-var name="--ngp-toasts-before" description="The number of toasts before this one." />
  <api-css-var name="--ngp-toast-index" description="The index of the toast (1-based)." />
  <api-css-var name="--ngp-toast-height" description="The height of the toast in pixels." />
  <api-css-var name="--ngp-toast-offset" description="The vertical offset position of the toast." />
  <api-css-var name="--ngp-toast-front-height" description="The height of the front-most toast." />
  <api-css-var name="--ngp-toast-swipe-amount-x" description="The swipe amount on the X axis (pixel value)." />
  <api-css-var name="--ngp-toast-swipe-amount-y" description="The swipe amount on the Y axis (pixel value)." />
  <api-css-var name="--ngp-toast-swipe-x" description="The swipe value on the X axis." />
  <api-css-var name="--ngp-toast-swipe-y" description="The swipe value on the Y axis." />
</api-reference-css-vars>

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

<api-reference-config name="NgpToastConfig"></api-reference-config>

## Accessibility

For screen reader announcements, ensure your toast container includes `role="status"` or `role="alert"` with `aria-live="polite"` so that new toasts are announced to assistive technology users.
