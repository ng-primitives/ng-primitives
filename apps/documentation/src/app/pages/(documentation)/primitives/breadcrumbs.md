---
name: 'Breadcrumbs'
---

# Breadcrumbs

Help users understand their location within a hierarchy with a fully accessible breadcrumb trail.

<docs-example name="breadcrumbs"></docs-example>

## Import

Import the Breadcrumb primitives from `ng-primitives/breadcrumbs`.

```ts
import {
  NgpBreadcrumbs,
  NgpBreadcrumbList,
  NgpBreadcrumbItem,
  NgpBreadcrumbLink,
  NgpBreadcrumbSeparator,
  NgpBreadcrumbEllipsis,
  NgpBreadcrumbPage,
} from 'ng-primitives/breadcrumbs';
```

## Usage

Assemble the directives to build the breadcrumb structure, applying your own `aria-label` to describe the navigation context. You can optionally wire the ellipsis into the Menu primitives to expose collapsed sections.

```html
<nav aria-label="Breadcrumb" ngpBreadcrumbs>
  <ol ngpBreadcrumbList>
    <li ngpBreadcrumbItem>
      <a ngpBreadcrumbLink href="/">Home</a>
    </li>

    <li ngpBreadcrumbSeparator>/</li>

    <li ngpBreadcrumbItem>
      <button type="button" aria-label="Toggle breadcrumb menu">
        <span ngpBreadcrumbEllipsis>...</span>
      </button>
    </li>

    <li ngpBreadcrumbSeparator>/</li>

    <li ngpBreadcrumbItem>
      <a ngpBreadcrumbLink href="...">Components</a>
    </li>

    <li ngpBreadcrumbSeparator>/</li>

    <li ngpBreadcrumbItem>
      <span ngpBreadcrumbPage>Breadcrumbs</span>
    </li>
  </ol>
</nav>
```

## Reusable Component

Create reusable components that wrap the breadcrumb directives for your design system.

<docs-snippet name="breadcrumbs"></docs-snippet>

## Schematics

Generate a breadcrumb component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive breadcrumbs
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/breadcrumbs` package:

### NgpBreadcrumbs

<api-docs name="NgpBreadcrumbs"></api-docs>

### NgpBreadcrumbList

<api-docs name="NgpBreadcrumbList"></api-docs>

### NgpBreadcrumbItem

<api-docs name="NgpBreadcrumbItem"></api-docs>

### NgpBreadcrumbLink

<api-docs name="NgpBreadcrumbLink"></api-docs>

#### Data Attributes

| Attribute            | Description                                   |
| -------------------- | --------------------------------------------- |
| `data-hover`         | Applied when the breadcrumb link is hovered.  |
| `data-press`         | Applied when the breadcrumb link is pressed.  |
| `data-focus-visible` | Applied when the link receives focus visibly. |
| `data-current`       | Applied when the link represents the page.    |

### NgpBreadcrumbPage

<api-docs name="NgpBreadcrumbPage"></api-docs>

#### Data Attributes

| Attribute      | Description                               |
| -------------- | ----------------------------------------- |
| `data-current` | Applied to indicate the current location. |

### NgpBreadcrumbSeparator

<api-docs name="NgpBreadcrumbSeparator"></api-docs>

### NgpBreadcrumbEllipsis

<api-docs name="NgpBreadcrumbEllipsis"></api-docs>

## Accessibility

Adheres to the [WAI-ARIA Breadcrumb Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/).

- Breadcrumbs are rendered within a `nav` landmark with an accessible label.
- Separators are hidden from assistive technologies via `role="presentation"` and `aria-hidden`.
- The current location uses `aria-current="page"` for accurate announcements.
