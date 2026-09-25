---
title: File Upload | Angular Primitives
name: 'File Upload'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/file-upload'
---

# File Upload

The file upload primitive allows you to trigger a file upload from any element, giving you the more control over the appearance and behavior compared to the native file input.

<docs-example name="file-upload"></docs-example>

## Import

Import the FileUpload primitives from `ng-primitives/file-upload`.

```ts
import { NgpFileUpload } from 'ng-primitives/file-upload';
```

## Usage

Assemble the file-upload directives in your template.

```html
<button
  ngpFileUpload
  (ngpFileUploadSelected)="onFilesSelected($event)"
  (ngpFileUploadCanceled)="onCancel()"
></button>
```

## Reusable Component

Create a file upload component that uses the `NgpFileUpload` directive.

<docs-snippet name="file-upload"></docs-snippet>

## Schematics

Generate a reusable file upload component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive file-upload
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `styles`: How component styles should be generated.
  - `css` (default): includes the full example styles.
  - `tailwind`: styles the elements with Tailwind CSS classes instead, keeping a small CSS block only for what Tailwind cannot express.
  - `unstyled`: omits styling entirely so you can style the component yourself.
- `example-styles` (deprecated): still supported for compatibility - `true` maps to `styles: css`, `false` maps to `styles: unstyled`.

## Examples

### File Dropzone

The file dropzone primitive allows you to create a dropzone for files. This functionality is built into the file upload primitive, but can also be used separately if you don't want to show the file upload dialog on click.

<docs-example name="file-dropzone"></docs-example>

### Validating Files

Limit what can be selected with `fileTypes`, `maxFileSize` (in bytes) and `multiple`. Every source is validated the same way, including files chosen in the dialog, where `accept` is only a hint the user can bypass.

Valid files are emitted through `selected`. Every file that fails is emitted through `rejectedFiles` along with the reasons it failed (`'type'`, `'size'` or `'count'` for files beyond the first when `multiple` is off), even when other files were accepted. `rejected` only fires when no file was accepted.

```html
<button
  ngpFileUpload
  ngpFileUploadFileTypes="image/*,.pdf"
  ngpFileUploadMaxFileSize="5242880"
  (ngpFileUploadSelected)="upload($event)"
  (ngpFileUploadRejectedFiles)="showErrors($event)"
>
  Upload
</button>
```

### Pasting Files

Pasting is opt-in. Set `paste` to `'host'` (or add the bare attribute) to accept files pasted while the element is focused, or to `'document'` to accept files pasted anywhere on the page. Pasted files go through the same validation as dropped files, and pastes that contain no files, or that land in a text field, are left alone.

Document mode pairs well with a dialog: the dropzone, and its paste listener, only exist while the dialog is open, so users can paste without focusing anything first.

<docs-example name="file-dropzone-paste"></docs-example>

In host mode an element that is not already focusable gets `tabindex="0"`, as a paste only reaches the focused element. When a focused host-mode instance handles a paste, document-mode instances ignore it. Use at most one document-mode instance per page, as the order they receive a paste in is not guaranteed.

## API Reference

The following directives are available to import from the `ng-primitives/file-upload` package:

### NgpFileUpload

<api-docs name="NgpFileUpload"></api-docs>

<api-reference-props name="NgpFileUpload"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-hover" description="Applied when the element is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the element is focus visible." />
  <api-attribute name="data-press" description="Applied when the element is pressed." />
  <api-attribute name="data-dragover" description="Applied when a file is dragged over the element." />
  <api-attribute name="data-disabled" description="Applied when the element is disabled." />
</api-reference-attributes>

### NgpFileDropzone

<api-docs name="NgpFileDropzone"></api-docs>

<api-reference-props name="NgpFileDropzone"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-hover" description="Applied when the element is hovered." />
  <api-attribute name="data-dragover" description="Applied when a file is dragged over the element." />
  <api-attribute name="data-disabled" description="Applied when the element is disabled." />
</api-reference-attributes>

## Global Configuration

You can configure the default options for all file uploads and file dropzones in your application by using the `provideFileUploadConfig` and `provideFileDropzoneConfig` functions in a providers array.

```ts
import { provideFileDropzoneConfig, provideFileUploadConfig } from 'ng-primitives/file-upload';

bootstrapApplication(AppComponent, {
  providers: [
    provideFileUploadConfig({
      fileTypes: ['image/png', '.jpg'],
      multiple: true,
      dragAndDrop: false,
    }),
    provideFileDropzoneConfig({
      fileTypes: ['image/png', '.jpg'],
      multiple: true,
    }),
  ],
});
```

Any input set on a primitive takes precedence over the configured default.

### NgpFileUploadConfig

<api-reference-config name="NgpFileUploadConfig"></api-reference-config>

### NgpFileDropzoneConfig

<api-reference-config name="NgpFileDropzoneConfig"></api-reference-config>

## Accessibility

The file upload primitive should be applied to a `<button>` element or another interactive element for keyboard accessibility. The file dropzone is a drag-and-drop target and is not keyboard accessible by default — ensure an alternative method (such as the file upload trigger) is always available.

### Keyboard Interactions

- <kbd>Enter</kbd> / <kbd>Space</kbd>: Open the file selection dialog (when applied to a button).
- <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>V</kbd>: Select files from the clipboard (when `paste` is enabled).
