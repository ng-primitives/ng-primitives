---
name: 'Focus Visible'
---

# Focus Visible

Determine whether focus should be visible based on user interaction.

<docs-example name="focus-visible"></docs-example>

## Import

Import the Focus Visible primitives from `ng-primitives/interactions`.

```ts
import { NgpFocusVisible } from 'ng-primitives/interactions';
```

## Usage

Assemble the focus-visible directives in your template.

```html
<div (ngpFocusVisible)="onFocusVisible($event)"></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/interactions` package:

### NgpFocusVisible

- Selector: `[ngpFocusVisible]`
- Exported As: `ngpFocusVisible`

<response-field name="ngpFocusVisibleDisabled" type="boolean">
  Whether listening for focus-visible events is disabled.
</response-field>

<response-field name="ngpFocusVisible" type="EventEmitter<boolean>">
  Event emitted when the focus visible state changes.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpFocusVisible` directive:

| Attribute            | Description                                         | Value             |
| -------------------- | --------------------------------------------------- | ----------------- |
| `data-focus-visible` | Whether the element should be visible when focused. | `true` \| `false` |
