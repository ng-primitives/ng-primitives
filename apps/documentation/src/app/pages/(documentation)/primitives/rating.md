---
name: 'Rating'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/rating'
---

# Rating

Capture a star rating within a range.

**Note:** The rating primitives are currently experimental. The API may change in future releases.

<docs-example name="rating"></docs-example>

## Import

Import the Rating primitives from `ng-primitives/rating`.

```ts
import { NgpRating, NgpRatingItem } from 'ng-primitives/rating';
```

## Usage

Apply the `ngpRating` directive to the container and project the item template
once with the `*ngpRatingItem` structural directive. The container renders one
item per `ngpRatingCount`, exposing the derived state of each item as the
template context.

```html
<div ngpRating [(ngpRatingValue)]="value" [ngpRatingCount]="5">
  <span *ngpRatingItem="let star">{{ star.checked ? '★' : '☆' }}</span>
</div>
```

The `star` context provides `index`, `checked`, `half`, `fraction` (a `0`-`1`
fill amount) and `highlighted` (whether the item is part of the current hover
preview).

## Reusable Component

Create a reusable component that uses the rating directives.

<docs-snippet name="rating"></docs-snippet>

## Schematics

Generate a reusable rating component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive rating
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## Examples

### Half Ratings

Set `ngpRatingAllowHalf` to allow half-star increments. The pointer position
within an item selects the left or right half, and the arrow keys step by `0.5`.
Use the `fraction` context value to clip the fill for a partially selected item.

<docs-example name="rating-half"></docs-example>

### Read-only

Set `ngpRatingReadonly` to display a value without allowing edits, for example
when showing an average score. A read-only rating stays focusable so assistive
technology can announce it. Fractional values such as `3.7` are exposed through
the per-item `fraction`, so you can render a precise partial fill.

<docs-example name="rating-readonly"></docs-example>

### Disabled

Set `ngpRatingDisabled` to make the rating non-interactive and remove it from the
tab order.

<docs-example name="rating-disabled"></docs-example>

### Deselection

By default a rating can't be cleared once set - re-selecting the current value is
a no-op and the keyboard can't take an existing rating below `1`. Set
`[ngpRatingClearable]="true"` to allow deselection: clicking the currently
selected value clears the rating to `0`, and <kbd>Home</kbd> / arrow keys can
reach `0`.

<docs-example name="rating-clearable"></docs-example>

## API Reference

The following directives are available to import from the `ng-primitives/rating` package:

### NgpRating

<api-docs name="NgpRating"></api-docs>

<api-reference-props name="NgpRating"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-disabled" description="Applied when the rating is disabled." />
  <api-attribute name="data-readonly" description="Applied when the rating is read-only." />
  <api-attribute name="data-hovered" description="Applied while the rating is being hovered." />
</api-reference-attributes>

### NgpRatingItem

<api-docs name="NgpRatingItem"></api-docs>

A structural directive that renders one item per `ngpRatingCount`. Each rendered
element automatically receives `data-checked`, `data-half` and `data-highlighted`
attributes reflecting its state, so you can style items entirely from CSS without
binding them by hand.

The template context (`let star`) exposes the same state for use in markup (for
example choosing an icon or clipping the fill width):

- `index`: the 1-based position of the item.
- `checked`: whether the item is fully filled.
- `half`: whether the item is half filled (only when `ngpRatingAllowHalf`).
- `fraction`: the fill amount of the item, `0`-`1`.
- `highlighted`: whether the item is part of the current hover preview.

<api-reference-attributes>
  <api-attribute name="data-checked" description="Applied when the item is fully filled." />
  <api-attribute name="data-half" description="Applied when the item is half filled (allowHalf only)." />
  <api-attribute name="data-highlighted" description="Applied when the item is part of the current hover preview." />
</api-reference-attributes>

## Global Configuration

You can configure the default options for all ratings in your application by using the `provideRatingConfig` function in a providers array.

```ts
import { provideRatingConfig } from 'ng-primitives/rating';

bootstrapApplication(AppComponent, {
  providers: [
    provideRatingConfig({
      count: 5,
      clearable: false,
      valueText: (value, count) => `${value} out of ${count} stars`,
    }),
  ],
});
```

## Accessibility

Adheres to the [Slider WAI-ARIA design pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/). The rating exposes `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and an `aria-valuetext` describing the current value.

### Keyboard Interactions

- <kbd>Left Arrow</kbd> or <kbd>Down Arrow</kbd>: Decrease the value by the step (`0.5` when half ratings are allowed, otherwise `1`).
- <kbd>Right Arrow</kbd> or <kbd>Up Arrow</kbd>: Increase the value by the step.
- <kbd>Home</kbd>: Clear the value to `0`.
- <kbd>End</kbd>: Set the value to the maximum.
