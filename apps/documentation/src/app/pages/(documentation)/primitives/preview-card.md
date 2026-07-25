---
title: Preview Card | Angular Primitives
name: 'Preview Card'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/preview-card'
---

# Preview Card

Preview the content behind a link on hover or keyboard focus. Also known as a hover card or link preview.

<docs-example name="preview-card"></docs-example>

## Import

Import the Preview Card primitives from `ng-primitives/preview-card`.

```ts
import {
  NgpPreviewCard,
  NgpPreviewCardTrigger,
  NgpPreviewCardArrow,
} from 'ng-primitives/preview-card';
```

## Usage

Assemble the preview card directives in your template. The trigger should be an element that is independently useful without the card - typically a link to the content the card previews.

```html
<a href="https://angularprimitives.com" [ngpPreviewCardTrigger]="card">Angular Primitives</a>

<ng-template #card>
  <div ngpPreviewCard>Preview content</div>
</ng-template>
```

## Preview Card vs Tooltip vs Popover

Pick by interaction pattern rather than appearance. A tooltip labels a control with a short piece of text. A popover holds content the user actively works with, so it opens on click and traps focus inside itself. A preview card sits between them: it opens on hover or keyboard focus like a tooltip, but holds rich content like a popover, and focus stays on the trigger throughout.

Unlike both of those, a preview card is not exposed to assistive technology and cannot be opened on touch, so reach for a popover whenever the content actually matters.

## Reusable Component

Create a preview card component that uses the `NgpPreviewCard` directive.

<docs-snippet name="preview-card"></docs-snippet>

## Schematics

Generate a reusable preview card component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive preview-card
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

### Custom delays

The open delay is deliberately long so that cards do not appear while the pointer travels across a page full of links. Shorten it when the trigger is isolated, or lengthen it in dense text.

<docs-example name="preview-card-delays"></docs-example>

### Arrow

Add `ngpPreviewCardArrow` inside the card to point back at the trigger.

<docs-example name="preview-card-arrow"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/preview-card` package:

### NgpPreviewCardTrigger

<api-docs name="NgpPreviewCardTrigger"></api-docs>

<api-reference-props name="NgpPreviewCardTrigger"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-open" description="Applied when the preview card is open." />
  <api-attribute name="data-placement" description="The configured placement of the preview card." />
  <api-attribute name="data-disabled" description="Applied when the preview card is disabled." />
</api-reference-attributes>

### NgpPreviewCard

<api-docs name="NgpPreviewCard"></api-docs>

<api-reference-props name="NgpPreviewCard"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-enter" description="Applied when the preview card is being added to the DOM. This can be used to trigger animations." />
  <api-attribute name="data-exit" description="Applied when the preview card is being removed from the DOM. This can be used to trigger animations." />
  <api-attribute name="data-placement" description="The final rendered placement of the preview card." />
</api-reference-attributes>

<api-reference-css-vars>
  <api-css-var name="--ngp-preview-card-transform-origin" description="The transform origin of the preview card for animations." />
  <api-css-var name="--ngp-preview-card-trigger-width" description="The width of the trigger element." />
  <api-css-var name="--ngp-preview-card-available-width" description="The available width of the preview card before it overflows the viewport." />
  <api-css-var name="--ngp-preview-card-available-height" description="The available height of the preview card before it overflows the viewport." />
</api-reference-css-vars>

### NgpPreviewCardArrow

The `NgpPreviewCardArrow` directive adds an arrow to the preview card. It should be placed inside the card content. It receives `inset-inline-start` or `inset-block-start` styles to position the arrow based on the card's placement, so it should be positioned absolutely within the card.

The arrow can be styled conditionally based on the card's final placement using the `data-placement` attribute:

```css
[ngpPreviewCardArrow][data-placement='top'] {
  /* Arrow styles when the card is positioned on top */
}
```

<api-docs name="NgpPreviewCardArrow"></api-docs>

<api-reference-props name="NgpPreviewCardArrow"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-placement" description="The final rendered placement of the preview card." />
</api-reference-attributes>

## Styling

For the preview card to be positioned correctly relative to the trigger, it must use absolute or fixed positioning:

```css
[ngpPreviewCard] {
  position: absolute;
}
```

## Animations

The `ngpPreviewCard` primitive adds a `--ngp-preview-card-transform-origin` CSS custom property that can be used to animate the card from the trigger element, and applies the `data-enter` and `data-exit` attributes while the card is being added to or removed from the DOM.

```css
[ngpPreviewCard][data-enter] {
  animation: fade-in 0.15s ease-out;
}

[ngpPreviewCard][data-exit] {
  animation: fade-out 0.12s ease-out;
}
```

## Global Configuration

You can configure the default options for all preview cards in your application by using the `providePreviewCardConfig` function in a providers array.

```ts
import { providePreviewCardConfig } from 'ng-primitives/preview-card';

bootstrapApplication(AppComponent, {
  providers: [
    providePreviewCardConfig({
      placement: 'bottom',
      offset: 4,
      showDelay: 600,
      hideDelay: 300,
      flip: true,
      container: 'body',
      scrollBehavior: 'reposition',
      cooldown: 300,
    }),
  ],
});
```

### NgpPreviewCardConfig

<api-reference-config name="NgpPreviewCardConfig"></api-reference-config>

## Accessibility

A preview card is a visual enhancement for sighted pointer and keyboard users. There is no WAI-ARIA pattern for this behaviour, and every headless library that implements it - [Radix](https://www.radix-ui.com/primitives/docs/components/hover-card), [Base UI](https://base-ui.com/react/components/preview-card), Ark UI and Kobalte - documents it as a deliberate limitation. We do the same.

**The card is not exposed to assistive technology.** The content carries no `role` and is not linked to the trigger, and the trigger receives no `aria-expanded`, `aria-haspopup`, `aria-controls` or `aria-describedby`. This is intentional: announcing a rich, interactive card as a link's _description_ is worse than saying nothing, and `aria-expanded` would advertise a disclosure that cannot be operated by keyboard.

Because of that, the following rules matter:

- **The trigger must work without the card.** Use a real link (or another independently useful control). The card previews where the trigger goes; it is never the only route to that content.
- **Never put unique content or actions in the card.** Anything inside it must be reachable another way, because screen reader and touch users will not see it.
- **Style the trigger as a link** with something other than colour alone, such as an underline, to satisfy [WCAG 1.4.1 Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html).

### Keyboard Interactions

- <kbd>Tab</kbd>: Moves focus to the trigger, which opens the card. Tabbing again moves into the card if it contains focusable content, or past it if not.
- <kbd>Esc</kbd>: Closes the card.
- <kbd>Enter</kbd>: Activates the trigger.
