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
<button ngpFileUpload (ngpFileUploadSelected)="onFilesSelected($event)"></button>
```

## Schematics

Generate a file-upload component with the `NgpFileUpload` primitive preconfigured.

```bash npm
 ng g ng-primitives:file-upload
```

## API Reference

The following directives are available to import from the `ng-primitives/file-upload` package:

### NgpFileUpload

A directive that allows you to turn any element into a file upload trigger.

- Selector: `[ngpFileUpload]`
- Exported As: `ngpFileUpload`
- Host Directives: [NgpHover](/interactions/hover), [NgpFocusVisible](/interactions/focus-visible), [NgpPress](/interactions/press)

<response-field name="ngpFileUploadMultiple" type="boolean" default="false">
  Define if multiple files can be selected.
</response-field>

<response-field name="ngpFileUploadFileTypes" type="string[]">
  Define the file types that can be selected.
</response-field>

<response-field name="ngpFileUploadDirectory" type="boolean" default="false">
  Define if directories can be selected.
</response-field>

<response-field name="ngpFileUploadDragDrop" type="boolean" default="true">
  Define if drag and drop is enabled.
</response-field>

<response-field name="ngpFileUploadDisabled" type="boolean" default="false">
  Define if the file upload is disabled.
</response-field>

<response-field name="ngpFileUploadSelected" type="EventEmitter<FileList | null>">
  Event emitted when files are selected.
</response-field>

<response-field name="ngpFileUploadDragOver" type="EventEmitter<boolean>">
  Event emitted when a file is dragged over or out of the element.
</response-field>

#### Data Attributes

| Attribute            | Description                                  | Value             |
| -------------------- | -------------------------------------------- | ----------------- |
| `data-hover`         | If the file upload is being hovered over.    | `true` \| `false` |
| `data-focus-visible` | If the file upload is focused.               | `true` \| `false` |
| `data-press`         | If the file upload is being pressed.         | `true` \| `false` |
| `data-dragover`      | If a file is being dragged over the element. | `true` \| `false` |
| `data-disabled`      | If the file upload is disabled.              | `true` \| `false` |
