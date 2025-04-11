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

<prop-details name="ngpMoveDisabled" type="boolean">
  Disables the move interaction.
</prop-details>

<prop-details name="ngpMoveStart" type="OutputEmitterRef<NgpMoveStartEvent>">
  Emits when the move interaction starts.
</prop-details>

<prop-details name="ngpMove" type="OutputEmitterRef<NgpMoveEvent>">
  Emits when the move interaction is in progress.
</prop-details>

<prop-details name="ngpMoveEnd" type="OutputEmitterRef<NgpMoveEndEvent>">
  Emits when the move interaction ends.
</prop-details>

#### Data Attributes

The following data attributes are available to use with the `NgpMove` directive:

| Attribute   | Description                              |
| ----------- | ---------------------------------------- |
| `data-move` | Applied when the element is being moved. |
