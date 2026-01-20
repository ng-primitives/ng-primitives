---
name: 'File Upload'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/main/packages/ng-primitives/file-upload'
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

## Examples

### File Dropzone

The file dropzone primitive allows you to create a dropzone for files. This functionality is built into the file upload primitive, but can also be used separately if you don't want to show the file upload dialog on click.

<docs-example name="file-dropzone"></docs-example>

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
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/file-upload` package:

### NgpFileUpload

<api-docs name="NgpFileUpload"></api-docs>

#### Data Attributes

| Attribute            | Description                                      |
| -------------------- | ------------------------------------------------ |
| `data-hover`         | Applied when the element is hovered.             |
| `data-focus-visible` | Applied when the element is focus visible.       |
| `data-press`         | Applied when the element is pressed.             |
| `data-dragover`      | Applied when a file is dragged over the element. |
| `data-disabled`      | Applied when the element is disabled.            |

### NgpFileDropzone

<api-docs name="NgpFileDropzone"></api-docs>

#### Data Attributes

| Attribute       | Description                                      |
| --------------- | ------------------------------------------------ |
| `data-hover`    | Applied when the element is hovered.             |
| `data-dragover` | Applied when a file is dragged over the element. |
| `data-disabled` | Applied when the element is disabled.            |
