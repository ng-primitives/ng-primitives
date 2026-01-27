---
name: 'Visually Hidden'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/visually-hidden'
---

# Visually Hidden

Hide an element visually while keeping it present in the DOM. This is particularly useful for accessibility purposes, ensuring that screen readers and other assistive technologies can still interact with the hidden content.

## Import

Import the VisuallyHidden primitives from `ng-primitives/a11y`.

```ts
import { NgpVisuallyHidden } from 'ng-primitives/a11y';
```

## Usage

Assemble the visually-hidden directives in your template.

```html
<div ngpVisuallyHidden></div>
```

## API Reference

The following directives are available to import from the `ng-primitives/a11y` package:

### NgpVisuallyHidden

<api-docs name="NgpVisuallyHidden"></api-docs>

## Accessibility

This directive can be useful for hiding content that is still important for screen readers and other assistive technologies.
