---
name: 'Button'
---

# Button

A button is a clickable element that can be used to trigger an action.

<docs-example name="button"></docs-example>

## Import

Import the Button primitives from `ng-primitives/button`.

```ts
import { NgpButton } from 'ng-primitives/button';
```

## Usage

Assemble the button directives in your template.

```html
<button ngpButton>Button</button>
```

## API Reference

The following directives are available to import from the `ng-primitives/button` package:

### NgpButton

A directive that can be used to create a button.

- Selector: `[ngpButton]`
- Exported As: `ngpButton`
- Host Directives: [NgpHover](/interactions/hover), [NgpFocusVisible](/interactions/focus-visible), [NgpPress](/interactions/press)

#### Data Attributes

| Attribute            | Description                       | Value             |
| -------------------- | --------------------------------- | ----------------- |
| `data-hover`         | The hover state of the button.    | `true` \| `false` |
| `data-focus-visible` | The focus state of the button.    | `true` \| `false` |
| `data-press`         | The pressed state of the button.  | `true` \| `false` |
| `data-disabled`      | The disabled state of the button. | `true` \| `false` |
