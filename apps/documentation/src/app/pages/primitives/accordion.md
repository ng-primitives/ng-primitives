---
name: 'Accordion'
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
    <button ngpAccordionTrigger ngpButton>Would you like to learn more?</button>
    <div ngpAccordionContent>If you would like to learn more please reach out to us on GitHub.</div>
  </div>

  <div ngpAccordionItem ngpAccordionItemValue="item-2">
    <button ngpAccordionTrigger ngpButton>Can I use this in my project?</button>
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
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/accordion` package:

### NgpAccordion

<api-docs name="NgpAccordion"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpAccordion` directive:

| Attribute          | Description                           | Value                      |
| ------------------ | ------------------------------------- | -------------------------- |
| `data-orientation` | The orientation of the accordion.     | `horizontal` \| `vertical` |
| `data-disabled`    | Applied when the element is disabled. | `-`                        |

### NgpAccordionItem

<api-docs name="NgpAccordionItem"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpAccordionItem` directive:

| Attribute          | Description                                  | Value                      |
| ------------------ | -------------------------------------------- | -------------------------- |
| `data-orientation` | The orientation of the accordion.            | `horizontal` \| `vertical` |
| `data-open`        | Applied when the accordion item is open.     | `-`                        |
| `data-disabled`    | Applied when the accordion item is disabled. | `-`                        |

### NgpAccordionTrigger

<api-docs name="NgpAccordionTrigger"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpAccordionTrigger` directive:

| Attribute          | Description                                  | Value                      |
| ------------------ | -------------------------------------------- | -------------------------- |
| `data-orientation` | The orientation of the accordion.            | `horizontal` \| `vertical` |
| `data-open`        | Applied when the accordion item is open.     | `-`                        |
| `data-disabled`    | Applied when the accordion item is disabled. | `-`                        |

### NgpAccordionContent

<api-docs name="NgpAccordionContent"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpAccordionContent` directive:

| Attribute          | Description                              | Value                      |
| ------------------ | ---------------------------------------- | -------------------------- |
| `data-orientation` | The orientation of the accordion.        | `horizontal` \| `vertical` |
| `data-open`        | Applied when the accordion item is open. | `-`                        |

## Animations

The `ngpAccordionContent` primitive adds several CSS custom properties `--ngp-accordion-content-width` and `--ngp-accordion-content-height` to the element that can be used to animate the accordion content on open and close.

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

<prop-details name="type" type="single | multiple">
  Define whether only one or multiple accordion items can be open at a time.
</prop-details>

<prop-details name="collapsible" type="boolean">
  Define an accordion can be collapsed. This is only applicable when `type` is set to `single`.
</prop-details>

<prop-details name="orientation" type="horizontal | vertical">
  Define the orientation of the accordion.
</prop-details>

## Accessibility

Adheres to the [Accordion WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/accordion).

### Keyboard Interactions

- <kbd>Space</kbd> - Toggle the expanded state of the accordion item when the trigger is focused.
- <kbd>Enter</kbd> - Toggle the expanded state of the accordion item when the trigger is focused.
