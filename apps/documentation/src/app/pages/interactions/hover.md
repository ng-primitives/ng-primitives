---
name: 'Hover'
---

# Hover

Normalizes the hover event across different browsers and devices.

<docs-example name="hover"></docs-example>

## Import

Import the Hover primitive from `ng-primitives/interactions`.

```ts
import { NgpHover } from 'ng-primitives/interactions';
```

## Usage

Assemble the hover directives in your template.

```html
<div
  (ngpHover)="onHoverChange($event)"
  (ngpHoverStart)="onHoverStart()"
  (ngpHoverEnd)="onHoverEnd()"
></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/interactions` package:

### NgpHover

<api-docs name="NgpHover"></api-docs>

#### Data Attributes

| Attribute    | Description                                |
| ------------ | ------------------------------------------ |
| `data-hover` | Added to the element when hovering occurs. |
