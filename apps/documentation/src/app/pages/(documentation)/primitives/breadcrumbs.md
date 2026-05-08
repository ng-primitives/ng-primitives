---
name: 'Breadcrumbs'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/breadcrumbs'
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

## API Reference

The following directives are available to import from the `ng-primitives/breadcrumbs` package:

### NgpBreadcrumbs

<api-docs name="NgpBreadcrumbs"></api-docs>

<api-reference-props name="NgpBreadcrumbs"></api-reference-props>

### NgpBreadcrumbList

<api-docs name="NgpBreadcrumbList"></api-docs>

<api-reference-props name="NgpBreadcrumbList"></api-reference-props>

### NgpBreadcrumbItem

<api-docs name="NgpBreadcrumbItem"></api-docs>

<api-reference-props name="NgpBreadcrumbItem"></api-reference-props>

### NgpBreadcrumbLink

<api-docs name="NgpBreadcrumbLink"></api-docs>

<api-reference-props name="NgpBreadcrumbLink"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-hover" description="Applied when the breadcrumb link is hovered." />
  <api-attribute name="data-press" description="Applied when the breadcrumb link is pressed." />
  <api-attribute name="data-focus-visible" description="Applied when the link receives focus visibly." />
  <api-attribute name="data-current" description="Applied when the link represents the page." />
</api-reference-attributes>

### NgpBreadcrumbPage

<api-docs name="NgpBreadcrumbPage"></api-docs>

<api-reference-props name="NgpBreadcrumbPage"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-current" description="Applied to indicate the current location." />
</api-reference-attributes>

### NgpBreadcrumbSeparator

<api-docs name="NgpBreadcrumbSeparator"></api-docs>

<api-reference-props name="NgpBreadcrumbSeparator"></api-reference-props>

### NgpBreadcrumbEllipsis

<api-docs name="NgpBreadcrumbEllipsis"></api-docs>

<api-reference-props name="NgpBreadcrumbEllipsis"></api-reference-props>

## Accessibility

Adheres to the [WAI-ARIA Breadcrumb Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/).

- Breadcrumbs are rendered within a `nav` landmark with an accessible label.
- Separators are hidden from assistive technologies via `role="presentation"` and `aria-hidden`.
- The current location uses `aria-current="page"` for accurate announcements.
