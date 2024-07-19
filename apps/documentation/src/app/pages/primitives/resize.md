---
name: 'Resize'
---

# Resize

Perform actions on element resize.

<docs-example name="resize"></docs-example>

## Import

Import the Resize primitive from `ng-primitives/resize`.

```ts
import { NgpResize } from 'ng-primitives/resize';
```

## Usage

Assemble the resize directives in your template.

```html
<div (ngpResize)="onResize($event)"></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/resize` package:

### NgpResize

Apply the `ngpResize` directive to an element to listen for resize events.

- Selector: `[ngpResize]`
- Exported As: `ngpResize`

<response-field name="ngpResize" type="boolean">
  Event emitted when the element is resize.
</response-field>
