---
name: 'Move'
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

The `NgpMove` directive is used to enable the pointer and keyboard move interactions on an element.

- Selector: `[ngpMove]`
- Exported As: `ngpMove`

<response-field name="ngpMoveDisabled" type="boolean">
  Disables the move interaction.
</response-field>

<response-field name="ngpMoveStart" type="EventEmitter<NgpMoveStartEvent>">
  Emits when the move interaction starts.
</response-field>

<response-field name="ngpMove" type="EventEmitter<NgpMoveEvent>">
  Emits when the move interaction is in progress.
</response-field>

<response-field name="ngpMoveEnd" type="EventEmitter<NgpMoveEndEvent>">
  Emits when the move interaction ends.
</response-field>

#### Data Attributes

The following data attributes are available to use with the `NgpMove` directive:

| Attribute   | Description                              |
| ----------- | ---------------------------------------- |
| `data-move` | Applied when the element is being moved. |
