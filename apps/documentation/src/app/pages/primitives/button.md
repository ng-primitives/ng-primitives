---
name: 'Button'
---

# Button

A button is a clickable element that can be used to trigger an action. This primitive enhances the native button element with improved accessibility and interaction handling for hover, press and focus.

<docs-example name="button"></docs-example>

## Import

Import the Button primitives from `ng-primitives/button`.

```ts
import { NgpButton } from 'ng-primitives/button';
```

## Usage

Assemble the button directives in your template.

```html
<button ngpButton>Button</button>
```

## Reusable Component

Create a button component that uses the `NgpButton` directive.

<docs-snippet name="button"></docs-snippet>

### Button Sizes

You can add size support to your reusable button component. This is implemented at the component level rather than in the primitive to provide more flexibility for different design systems.

<docs-example name="button-sizes"></docs-example>

#### Usage

```html
<!-- Small button -->
<button app-button size="sm">Small Button</button>

<!-- Default (Medium) button -->
<button app-button>Default Button</button>

<!-- Large button -->
<button app-button size="lg">Large Button</button>

<!-- Extra Large button -->
<button app-button size="xl">Extra Large Button</button>
```

### Button Variants

You can add variant support to your reusable button component to indicate different purposes or importance levels.

<docs-example name="button-variants"></docs-example>

#### Usage

```html
<!-- Primary button (default) -->
<button app-button>Primary</button>

<!-- Secondary button -->
<button variant="secondary" app-button>Secondary</button>

<!-- Destructive button -->
<button variant="destructive" app-button>Destructive</button>

<!-- Outline button -->
<button variant="outline" app-button>Outline</button>

<!-- Ghost button -->
<button variant="ghost" app-button>Ghost</button>

<!-- Link button -->
<button variant="link" app-button>Link</button>
```

#### Variant Types

| Variant       | Description                                                  | Visual Characteristics                                     | Recommended Use                                       |
| ------------- | ------------------------------------------------------------ | ---------------------------------------------------------- | ----------------------------------------------------- |
| `primary`     | Default style, used for primary actions.                     | Solid background with high contrast, prominent appearance. | Main actions like "Submit", "Save", or "Continue".    |
| `secondary`   | Used for secondary actions that don't require primary focus. | Lighter background color, less prominent than primary.     | Alternative actions like "Cancel", "Back", or "View". |
| `destructive` | Used for destructive actions that may have consequences.     | Red or warning color to indicate caution.                  | Actions like "Delete", "Remove", or "Terminate".      |
| `outline`     | Button with an outline and transparent background.           | Border with transparent background, subtle appearance.     | Less important actions or in dense interfaces.        |
| `ghost`       | Button with no background or border until interaction.       | No background or border, only shows on hover/interaction.  | Toolbar actions, toggles, or in card headers.         |
| `link`        | Button that appears as a text link.                          | Appears as text with underline, no button-like appearance. | Navigation, "Learn more", or secondary page actions.  |

### Button with Icons

You can add icons to your buttons using any Angular icon library or simple SVG elements, but we recommend the [`@ng-icons`](https://github.com/ng-icons/ng-icons) library. This example shows how to create buttons with icons on the left, right, or both sides using content projection slots.

<docs-example name="button-icon"></docs-example>

#### Icon Slot System

The Button component uses Angular's content projection with named slots to position icons. The component provides two slots:

- `slot="left"` - Places content before the button text (left side)
- `slot="right"` - Places content after the button text (right side)

#### Usage

```html
<!-- Button with left icon -->
<button app-button>
  <ng-icon slot="left" name="lucideArrowRight"></ng-icon>
  Left Icon
</button>

<!-- Button with right icon -->
<button app-button>
  Right Icon
  <ng-icon slot="right" name="lucideCheck"></ng-icon>
</button>

<!-- Button with both icons -->
<button app-button>
  <ng-icon slot="left" name="lucideArrowRight"></ng-icon>
  Both Icons
  <ng-icon slot="right" name="lucideCheck"></ng-icon>
</button>

<!-- Button with icon and size variant -->
<button app-button size="lg">
  <ng-icon slot="left" name="lucideArrowRight"></ng-icon>
  Large with Icon
</button>
```

## Schematics

Generate a reusable button component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive button
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/button` package:

### NgpButton

<api-docs name="NgpButton"></api-docs>

#### Data Attributes

| Attribute            | Description                        |
| -------------------- | ---------------------------------- |
| `data-hover`         | Added to the button when hovered.  |
| `data-focus-visible` | Added to the button when focused.  |
| `data-press`         | Added to the button when pressed.  |
| `data-disabled`      | Added to the button when disabled. |
