---
name: 'Accordion'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/accordion'
---

# Accordion

Display a series of panels that can be expanded or collapsed.

<docs-example name="accordion"></docs-example>

## Import

Import the Accordion primitives from `ng-primitives/accordion`.

```ts
import {
  NgpAccordion,
  NgpAccordionItem,
  NgpAccordionTrigger,
  NgpAccordionContent,
} from 'ng-primitives/accordion';
```

## Usage

Assemble the accordion directives in your template.

```html
<div ngpAccordion ngpAccordionType="single" ngpAccordionCollapsible>
  <div ngpAccordionItem ngpAccordionItemValue="item-1">
    <h3>
      <button ngpAccordionTrigger ngpButton>Would you like to learn more?</button>
    </h3>
    <div ngpAccordionContent>If you would like to learn more please reach out to us on GitHub.</div>
  </div>

  <div ngpAccordionItem ngpAccordionItemValue="item-2">
    <h3>
      <button ngpAccordionTrigger ngpButton>Can I use this in my project?</button>
    </h3>
    <div ngpAccordionContent>Yes, this is open source and you can use it in your project.</div>
  </div>
</div>
```

## Reusable Component

Create reusable components that uses the `NgpAccordion` and `NgpAccordionItem` directives.

<docs-snippet name="accordion"></docs-snippet>

## Schematics

Generate a reusable accordion component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive accordion
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/accordion` package:

### NgpAccordion

<api-docs name="NgpAccordion"></api-docs>

<api-reference-props name="NgpAccordion"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-orientation" description="The orientation of the accordion." value="horizontal | vertical" />
  <api-attribute name="data-disabled" description="Applied when the element is disabled." />
</api-reference-attributes>

### NgpAccordionItem

<api-docs name="NgpAccordionItem"></api-docs>

<api-reference-props name="NgpAccordionItem"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-orientation" description="The orientation of the accordion." value="horizontal | vertical" />
  <api-attribute name="data-open" description="Applied when the accordion item is open." />
  <api-attribute name="data-disabled" description="Applied when the accordion item is disabled." />
</api-reference-attributes>

### NgpAccordionTrigger

<api-docs name="NgpAccordionTrigger"></api-docs>

<api-reference-props name="NgpAccordionTrigger"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-orientation" description="The orientation of the accordion." value="horizontal | vertical" />
  <api-attribute name="data-open" description="Applied when the accordion item is open." />
  <api-attribute name="data-disabled" description="Applied when the accordion item is disabled." />
</api-reference-attributes>

### NgpAccordionContent

<api-docs name="NgpAccordionContent"></api-docs>

<api-reference-props name="NgpAccordionContent"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-orientation" description="The orientation of the accordion." value="horizontal | vertical" />
  <api-attribute name="data-open" description="Applied when the accordion item is open." />
  <api-attribute name="data-enter" description="Applied when the accordion item is opening (user interaction). Removed when the enter animation ends." />
  <api-attribute name="data-exit" description="Applied when the accordion item is closing (user interaction). Removed when the exit animation ends." />
</api-reference-attributes>

<api-reference-css-vars>
  <api-css-var name="--ngp-accordion-content-width" description="The width of the accordion content." />
  <api-css-var name="--ngp-accordion-content-height" description="The height of the accordion content." />
</api-reference-css-vars>

## Animations

The `ngpAccordionContent` primitive sets `--ngp-accordion-content-width` and `--ngp-accordion-content-height` CSS custom properties on the element. Use these with the `data-enter` and `data-exit` attributes to animate open and close. These attributes are only set on user interaction — not on initial render — so no animation plays on page load.

## Global Configuration

You can configure the default options for all accordions in your application by using the `provideAccordionConfig` function in a providers array.

```ts
import { provideAccordionConfig } from 'ng-primitives/accordion';

bootstrapApplication(AppComponent, {
  providers: [
    provideAccordionConfig({
      type: 'multiple',
      collapsible: true,
      orientation: 'horizontal',
    }),
  ],
});
```

### NgpAccordionConfig

<api-reference-config name="NgpAccordionConfig"></api-reference-config>

## Accessibility

Adheres to the [Accordion WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion).

Tip: Per APG, wrap each trigger button in a heading element (e.g., `h3`) or an element with `role="heading"` and an appropriate `aria-level`. Ensure the button is the only child of the heading.

### Keyboard Interactions

- <kbd>Space</kbd> - Toggle the expanded state of the accordion item when the trigger is focused.
- <kbd>Enter</kbd> - Toggle the expanded state of the accordion item when the trigger is focused.

### Hidden Until Found

The `ngpAccordionContent` primitive uses the `until-found` attribute to allow the browser to search text within the hidden region and reveal the section if a match is found. If the browser does not support this functionality, the attribute is ignored.

More information about the `until-found` attribute can be found on [Can I use](https://caniuse.com/?search=hidden%20until-found).
