---
name: 'Collapsible'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/collapsible'
---

# Collapsible

A collapsible shows and hides an associated section of content, following the WAI-ARIA disclosure pattern.

<docs-example name="collapsible"></docs-example>

## Import

Import the Collapsible primitives from `ng-primitives/collapsible`.

```ts
import {
  NgpCollapsible,
  NgpCollapsibleTrigger,
  NgpCollapsibleContent,
} from 'ng-primitives/collapsible';
```

## Usage

Assemble the collapsible directives in your template.

```html
<div ngpCollapsible>
  <button ngpCollapsibleTrigger>Show details</button>
  <div ngpCollapsibleContent>The content that is shown and hidden.</div>
</div>
```

## Grouping Collapsibles

For a single collapsible, use this primitive directly. If you need multiple sections with coordinated open state - where opening one may close another - reach for the [Accordion](/primitives/accordion) primitive instead. Each accordion item is built on this same collapsible core.

## API Reference

The following directives are available to import from the `ng-primitives/collapsible` package:

### NgpCollapsible

<api-docs name="NgpCollapsible"></api-docs>

<api-reference-props name="NgpCollapsible"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the collapsible is open." />
  <api-attribute name="data-closed" description="Applied when the collapsible is closed." />
  <api-attribute name="data-disabled" description="Applied when the collapsible is disabled." />
  <api-attribute name="data-orientation" description="The orientation of the collapsible." value="horizontal | vertical" />
</api-reference-attributes>

### NgpCollapsibleTrigger

<api-docs name="NgpCollapsibleTrigger"></api-docs>

<api-reference-props name="NgpCollapsibleTrigger"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the collapsible is open." />
  <api-attribute name="data-closed" description="Applied when the collapsible is closed." />
  <api-attribute name="data-disabled" description="Applied when the collapsible is disabled." />
  <api-attribute name="data-orientation" description="The orientation of the collapsible." value="horizontal | vertical" />
</api-reference-attributes>

### NgpCollapsibleContent

<api-docs name="NgpCollapsibleContent"></api-docs>

<api-reference-props name="NgpCollapsibleContent"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the collapsible is open." />
  <api-attribute name="data-closed" description="Applied when the collapsible is closed." />
  <api-attribute name="data-disabled" description="Applied when the collapsible is disabled." />
  <api-attribute name="data-orientation" description="The orientation of the collapsible." value="horizontal | vertical" />
  <api-attribute name="data-enter" description="Applied when the collapsible is opening (user interaction). Removed on the content element's animationend event." />
  <api-attribute name="data-exit" description="Applied when the collapsible is closing (user interaction). Removed on the content element's animationend event." />
</api-reference-attributes>

<api-reference-css-vars>
  <api-css-var name="--ngp-collapsible-content-width" description="The width of the collapsible content." />
  <api-css-var name="--ngp-collapsible-content-height" description="The height of the collapsible content." />
</api-reference-css-vars>

## Animations

The `ngpCollapsibleContent` primitive sets `--ngp-collapsible-content-width` and `--ngp-collapsible-content-height` CSS custom properties on the element. Use these with the `data-enter` and `data-exit` attributes to animate open and close. These attributes are only set on user interaction - not on initial render - so no animation plays on page load.

## Accessibility

Adheres to the [Disclosure WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure).

The trigger exposes `aria-expanded` and `aria-controls`, pointing at the content region. When the trigger is a `<button>` element the correct `type="button"` is applied automatically.

### Keyboard Interactions

- <kbd>Space</kbd> - Toggle the collapsible when the trigger is focused.
- <kbd>Enter</kbd> - Toggle the collapsible when the trigger is focused.

### Hidden Until Found

The `ngpCollapsibleContent` primitive uses the `until-found` attribute so the browser can search text within the collapsed region and reveal it if a match is found. If the browser does not support this functionality, the attribute is ignored.

More information about the `until-found` attribute can be found on [Can I use](https://caniuse.com/?search=hidden%20until-found).
