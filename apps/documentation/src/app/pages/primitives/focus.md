---
title: 'Focus'
---

# Focus

<docs-example name="focus"></docs-example>

## Import

Import the Focus primitives from `ng-primitives/interactions`.

```ts
import { NgpFocus } from 'ng-primitives/interactions';
```

## Usage

Assemble the focus directives in your template.

```html
<div
  ngpFocus
  (ngpFocusFocused)="onFocused()"
  (ngpFocusBlurred)="onBlurred()"
  (ngpFocusChange)="onFocusChange($event)"
></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/interactions` package:

### NgpFocus

- Selector: `[ngpFocus]`
- Exported As: `ngpFocus`

<response-field name="ngpFocusDisabled" type="boolean">
  Whether listening for focus events is disabled.
</response-field>

<response-field name="ngpFocusFocused" type="void">
  Event emitted when the element receives focus.
</response-field>

<response-field name="ngpFocusBlurred" type="void">
  Event emitted when the element loses focus.
</response-field>

<response-field name="ngpFocusChange" type="boolean">
  Event emitted when the focus state changes.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpFocus` directive:

| Attribute      | Description                     | Value             |
| -------------- | ------------------------------- | ----------------- |
| `data-focused` | Whether the element is focused. | `true` \| `false` |
