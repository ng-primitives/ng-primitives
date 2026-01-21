---
name: 'Button'
---

# Button

The Button primitive provides consistent, accessible button behavior across any element. While native `&lt;button&gt;` elements work well in simple cases, this primitive solves common challenges: making non-native elements (like `&lt;div&gt;` or `&lt;span&gt;`) behave as buttons, ensuring proper keyboard support, and providing consistent interaction states for styling.

<docs-example name="button"></docs-example>

## Import

Import the Button primitive from `ng-primitives/button`.

```ts
import { NgpButton } from 'ng-primitives/button';
```

## Usage

Apply the directive to any element that should behave as a button.

```html
<button ngpButton>Button</button>
```

The primitive works on any element, not just `&lt;button&gt;`:

```html
<!-- Native button (recommended for most cases) -->
<button ngpButton>Submit</button>

<!-- Anchor as button -->
<a ngpButton href="/dashboard">Go to Dashboard</a>
<a ngpButton routerLink="/dashboard">Go to Dashboard</a>

<!-- Non-native element as button -->
<div ngpButton>Div Button</div>
<span ngpButton>Span Button</span>

<!-- Custom component as button -->
<app-button ngpButton>Custom Button</app-button>
```

## Reusable Component

Create a button component that uses the `NgpButton` directive.

<docs-snippet name="button"></docs-snippet>

## Examples

### Button Sizes

Add size support to your reusable button component. Size variants are implemented at the component level rather than in the primitive, giving you flexibility to match your design system.

<docs-example name="button-sizes"></docs-example>

### Button Variants

Add variant support to indicate different purposes or importance levels (primary, secondary, destructive, etc.).

<docs-example name="button-variants"></docs-example>

### Button with Icons

Add icons to your buttons using any Angular icon library or simple SVG elements. We recommend [`@ng-icons`](https://github.com/ng-icons/ng-icons). This example demonstrates leading, trailing, and icon-only buttons using content projection slots.

<docs-example name="button-icon"></docs-example>

### Loading States

When a button triggers an async operation, use [`NgpSoftDisabled`](/utilities/soft-disabled) to maintain focus during the loading state. This is important for accessibility&mdash;without it, keyboard users lose their place in the page when the button becomes disabled.

<docs-example name="button-loading"></docs-example>

#### Reusable Component with Loading State

Create a reusable button component that supports both disabled and loading states.

<docs-example name="button-loading-reusable"></docs-example>

#### Avoiding Conflicting Disabled States

Do not combine the native `disabled` attribute with `NgpSoftDisabled` on the same element. These represent different behaviors&mdash;native disabled removes the element from focus entirely, while soft disabled keeps it focusable. Using both creates an undefined state.

```html
<!-- ❌ Conflicting states - avoid this -->
<button ngpButton ngpSoftDisabled softDisabled disabled>Confused State</button>

<!-- ✅ Use native disabled for permanent/blocking states -->
<button ngpButton disabled>Not Allowed</button>

<!-- ✅ Use soft disabled for temporary states like loading -->
<button ngpButton ngpSoftDisabled [softDisabled]="loading()">
  {{ loading() ? 'Saving...' : 'Save' }}
</button>
```

## Schematics

Generate a reusable button component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive button
```

### Options

| Option            | Description                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `path`            | The path at which to create the component file.                                    |
| `prefix`          | The prefix to apply to the generated component selector.                           |
| `componentSuffix` | The suffix to apply to the generated component class name.                         |
| `fileSuffix`      | The suffix to apply to the generated component file name. Defaults to `component`. |
| `exampleStyles`   | Whether to include example styles. Defaults to `true`.                             |

## Accessibility

The Button primitive is designed to meet WCAG 2.1 requirements for keyboard operability (2.1.1) and name/role/value (4.1.2).

### Role Assignment

The primitive automatically assigns the correct ARIA role based on the element type:

| Element Type                                    | Behavior                                                    |
| ----------------------------------------------- | ----------------------------------------------------------- |
| `&lt;button&gt;`, `&lt;input type="button"&gt;` | No role added (browser provides implicit `button` role)     |
| `&lt;a&gt;` with `href`                         | No role added (preserves native `link` role for navigation) |
| Other elements (`&lt;div&gt;`, `&lt;span&gt;`)  | Adds `role="button"` for screen reader announcement         |

Override automatic role assignment when needed:

```html
<!-- Custom role for menu items, tabs, etc. -->
<div ngpButton role="menuitem">Edit</div>

<!-- Explicitly remove role -->
<div ngpButton [role]="null">Custom Element</div>
```

The `role` input initializes from the element's current `role` property, preserving any explicitly set values.

### Keyboard Support

For non-native elements, the primitive implements keyboard activation matching native button behavior:

| Key   | Action                                                             |
| ----- | ------------------------------------------------------------------ |
| Enter | Activates immediately on key down                                  |
| Space | Activates on key up, allowing users to cancel by moving focus away |

Native `&lt;button&gt;` elements and anchors with `href` use browser-native keyboard handling to avoid duplicate event firing.

## API Reference

The following directive is available from the `ng-primitives/button` package:

### NgpButton

<api-docs name="NgpButton"></api-docs>

#### Data Attributes

Use these attributes in your CSS to style interaction states:

| Attribute            | Description                                   |
| -------------------- | --------------------------------------------- |
| `data-hover`         | Present when the pointer is over the button.  |
| `data-focus-visible` | Present when focused via keyboard navigation. |
| `data-press`         | Present while the button is being pressed.    |
| `data-disabled`      | Present when the button is disabled.          |
