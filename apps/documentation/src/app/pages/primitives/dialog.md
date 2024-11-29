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

## API Reference

The following directives are available to import from the `ng-primitives/dialog` package:

### NgpDialog

The dialog container.

- Selector: `[ngpDialog]`
- Exported As: `ngpDialog`

<response-field name="ngpDialogRole" type="'dialog' | 'alertdialog">
  The role of the dialog. Use `'dialog'` for dialogs that require user interaction and `'alertdialog'` for dialogs that require immediate user attention.
</response-field>

<response-field name="ngpDialogModal" type="boolean">
  Whether the dialog is modal. A modal dialog prevents the user from interacting with the rest of the page until the dialog is closed.
</response-field>

### NgpDialogTitle

The dialog title.

- Selector: `[ngpDialogTitle]`
- Exported As: `ngpDialogTitle`

### NgpDialogDescription

The dialog description.

- Selector: `[ngpDialogDescription]`
- Exported As: `ngpDialogDescription`

### NgpDialogTrigger

Add to a button or link to open the dialog.

- Selector: `[ngpDialogTrigger]`
- Exported As: `ngpDialogTrigger`

<response-field name="ngpDialogTrigger" type="TemplateRef<NgpDialogContext>">
  The dialog template to open when the trigger is activated.
</response-field>

| Attribute            | Description                           |
| -------------------- | ------------------------------------- |
| `data-hover`         | Applied when the trigger is hovered.  |
| `data-focus-visible` | Applied when the trigger is focused.  |
| `data-press`         | Applied when the trigger is pressed.  |
| `data-disabled`      | Applied when the trigger is disabled. |

### NgpDialogOverlay

The dialog overlay.

- Selector: `[ngpDialogOverlay]`
- Exported As: `ngpDialogOverlay`

## Examples

### Dialog with external data

Data can be passed to the dialog using the `NgpDialogManager`.

<docs-example name="dialog-data"></docs-example>

## Accessibility

Adheres to the [WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/).

### Keyboard Interactions

- <kbd>Esc</kbd>: Close the dialog.
- <kbd>Tab</kbd>: Navigate through focusable elements within the dialog.
- <kbd>Shift</kbd> + <kbd>Tab</kbd>: Navigate backwards through focusable elements within the dialog.
