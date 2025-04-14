---
name: 'Focus'
---

# Focus

Normalizes the focus event across different browsers and devices.

<docs-example name="focus"></docs-example>

## Import

Import the Focus primitives from `ng-primitives/interactions`.

```ts
import { NgpFocus } from 'ng-primitives/interactions';
```

## Usage

Assemble the focus directives in your template.

```html
<div (ngpFocus)="onFocusChange($event)"></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/interactions` package:

### NgpFocus

<api-docs name="NgpFocus"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpFocus` directive:

| Attribute    | Description                          |
| ------------ | ------------------------------------ |
| `data-focus` | Applied when the element is focused. |
