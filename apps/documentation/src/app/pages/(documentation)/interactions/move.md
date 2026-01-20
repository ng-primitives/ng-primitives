---
name: 'Move'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/interactions/move'
---

# Move

The Move primitives enable pointer and keyboard move interactions on an element.

<docs-example name="move"></docs-example>

## Import

Import the Move primitives from `ng-primitives/interactions`.

```ts
import { NgpMove } from 'ng-primitives/interactions';
```

## Usage

Assemble the move directives in your template.

```html
<div (ngpMove)="onMove($event)"></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/interactions` package:

### NgpMove

<api-docs name="NgpMove"></api-docs>

#### Data Attributes

The following data attributes are available to use with the `NgpMove` directive:

| Attribute   | Description                              |
| ----------- | ---------------------------------------- |
| `data-move` | Applied when the element is being moved. |
