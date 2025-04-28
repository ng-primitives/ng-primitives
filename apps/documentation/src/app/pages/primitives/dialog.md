---
name: 'Dialog'
---

# Dialog

A dialog is a floating window that can be used to display information or prompt the user for input.

<docs-example name="dialog"></docs-example>

## Import

Import the Dialog primitives from `ng-primitives/dialog`.

```ts
import {
  NgpDialog,
  NgpDialogTitle,
  NgpDialogDescription,
  NgpDialogTrigger,
  NgpDialogOverlay,
} from 'ng-primitives/dialog';
```

## Usage

Assemble the dialog directives in your template.

```html
<button [ngpDialogTrigger]="dialog" ngpButton>Launch Dialog</button>

<ng-template #dialog let-close="close">
  <div ngpDialogOverlay>
    <div ngpDialog>
      <h1 ngpDialogTitle>Publish this article?</h1>
      <p ngpDialogDescription>
        Are you sure you want to publish this article? This action is irreversible.
      </p>
      <div class="dialog-footer">
        <button (click)="close()" ngpButton>Cancel</button>
        <button (click)="close()" ngpButton>Confirm</button>
      </div>
    </div>
  </div>
</ng-template>
```

## Reusable Component

Create reusable components that uses the `NgpDialog` and `NgpDialogTrigger` directives.

<docs-snippet name="dialog"></docs-snippet>

## Schematics

Generate a reusable dialog component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive dialog
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/dialog` package:

### NgpDialog

<api-docs name="NgpDialog"></api-docs>

| Attribute   | Description                         |
| ----------- | ----------------------------------- |
| `data-exit` | Applied when the dialog is closing. |

### NgpDialogTitle

<api-docs name="NgpDialogTitle"></api-docs>

### NgpDialogDescription

<api-docs name="NgpDialogDescription"></api-docs>

### NgpDialogTrigger

<api-docs name="NgpDialogTrigger"></api-docs>

| Attribute            | Description                           |
| -------------------- | ------------------------------------- |
| `data-hover`         | Applied when the trigger is hovered.  |
| `data-focus-visible` | Applied when the trigger is focused.  |
| `data-press`         | Applied when the trigger is pressed.  |
| `data-disabled`      | Applied when the trigger is disabled. |

### NgpDialogOverlay

<api-docs name="NgpDialogOverlay"></api-docs>

| Attribute   | Description                         |
| ----------- | ----------------------------------- |
| `data-exit` | Applied when the dialog is closing. |

## Examples

### Dialog with external data

Data can be passed to the dialog using the `NgpDialogManager`.

<docs-example name="dialog-data"></docs-example>

### Drawer

A drawer is a type of dialog that slides in from the side of the screen.

<docs-example name="dialog-drawer"></docs-example>

## Accessibility

Adheres to the [WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/).

### Keyboard Interactions

- <kbd>Esc</kbd>: Close the dialog.
- <kbd>Tab</kbd>: Navigate through focusable elements within the dialog.
- <kbd>Shift</kbd> + <kbd>Tab</kbd>: Navigate backwards through focusable elements within the dialog.
