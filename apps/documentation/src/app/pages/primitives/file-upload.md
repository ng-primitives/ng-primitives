---
name: 'File Upload'
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
