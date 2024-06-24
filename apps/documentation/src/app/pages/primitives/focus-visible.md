---
title: 'Focus Visible'
---

# FocusVisible

<docs-example name="focus-visible"></docs-example>

## Import

Import the Focus Visible primitives from `ng-primitives/interactions`.

```ts
import { NgpFocusVisible } from 'ng-primitives/interactions';
```

## Usage

Assemble the focus-visible directives in your template.

```html
<div ngpFocusVisible></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/interactions` package:

### NgpFocusVisible

- Selector: `[ngpFocusVisible]`
- Exported As: `ngpFocusVisible`

<response-field name="ngpFocusVisibleDisabled" type="boolean">
  Whether listening for focus-visible events is disabled.
</response-field>

<response-field name="ngpFocusVisibleChange" type="boolean">
  Event emitted when the focus visible state changes.
</response-field>
