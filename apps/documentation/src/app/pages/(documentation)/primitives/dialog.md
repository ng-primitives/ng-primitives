---
name: 'Dialog'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/dialog'
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
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/dialog` package:

### NgpDialog

<api-docs name="NgpDialog"></api-docs>

<api-reference-props name="NgpDialog"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-exit" description="Applied when the dialog is closing." />
</api-reference-attributes>

### NgpDialogTitle

<api-docs name="NgpDialogTitle"></api-docs>

<api-reference-props name="NgpDialogTitle"></api-reference-props>

### NgpDialogDescription

<api-docs name="NgpDialogDescription"></api-docs>

<api-reference-props name="NgpDialogDescription"></api-reference-props>

### NgpDialogTrigger

<api-docs name="NgpDialogTrigger"></api-docs>

<api-reference-props name="NgpDialogTrigger"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-hover" description="Applied when the trigger is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the trigger is focused." />
  <api-attribute name="data-press" description="Applied when the trigger is pressed." />
  <api-attribute name="data-disabled" description="Applied when the trigger is disabled." />
</api-reference-attributes>

### NgpDialogOverlay

<api-docs name="NgpDialogOverlay"></api-docs>

<api-reference-props name="NgpDialogOverlay"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-exit" description="Applied when the dialog is closing." />
</api-reference-attributes>

### NgpDialogManager

The `NgpDialogManager` can be used as an alternative to the `NgpDialogTrigger` directive for programmatically opening dialogs.

The manager provides methods to open, close, and query dialogs, and accepts a component or template reference to display.

<api-reference-config>
  <api-config-prop name="open" type="(component: Type | TemplateRef, options?: NgpDialogConfig) => NgpDialogRef" description="Opens a dialog with the specified component or template reference." />
  <api-config-prop name="closeAll" type="() => void" description="Closes all open dialogs." />
  <api-config-prop name="getDialogById" type="(id: string) => NgpDialogRef | undefined" description="Finds an open dialog by its ID." />
  <api-config-prop name="openDialogs" type="readonly NgpDialogRef[]" description="The list of currently open dialogs." />
  <api-config-prop name="afterOpened" type="Subject<NgpDialogRef>" description="Stream that emits when a dialog has been opened." />
  <api-config-prop name="afterAllClosed" type="Observable<void>" description="Stream that emits when all open dialogs have finished closing. Emits on subscribe if there are no open dialogs." />
</api-reference-config>

### NgpDialogRef

Reference returned by `NgpDialogManager.open()`. Provides methods to interact with the opened dialog.

<api-reference-config>
  <api-config-prop name="close" type="(result?: R, focusOrigin?: FocusOrigin) => Promise<void>" description="Closes the dialog, optionally returning a result value." />
  <api-config-prop name="afterClosed" type="Observable<R | undefined>" description="Observable that emits the dialog result when the dialog is closed." />
  <api-config-prop name="data" type="T" description="The data passed to the dialog via NgpDialogConfig.data." />
  <api-config-prop name="id" type="string" description="The unique ID for the dialog." />
  <api-config-prop name="disableClose" type="boolean | undefined" description="Whether the user is allowed to close the dialog." />
  <api-config-prop name="keydownEvents" type="Observable<KeyboardEvent>" description="Observable that emits keyboard events dispatched within the dialog." />
  <api-config-prop name="outsidePointerEvents" type="Observable<MouseEvent>" description="Observable that emits pointer events dispatched outside of the dialog." />
  <api-config-prop name="updatePosition" type="() => NgpDialogRef" description="Updates the position of the dialog. Currently a no-op as dialogs are CSS-centered." />
</api-reference-config>

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
