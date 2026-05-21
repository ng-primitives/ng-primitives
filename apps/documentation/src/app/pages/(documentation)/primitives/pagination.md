---
name: 'Pagination'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/pagination'
---

# Pagination

The Pagination primitives provide a set of directives to create a pagination control. The pagination control is used to navigate through a set of data that is split into multiple pages.

<docs-example name="pagination"></docs-example>

## Import

Import the Pagination primitives from `ng-primitives/pagination`.

```ts
import {
  NgpPagination,
  NgpPaginationButton,
  NgpPaginationFirst,
  NgpPaginationNext,
  NgpPaginationPrevious,
  NgpPaginationLast,
} from 'ng-primitives/pagination';
```

## Usage

Assemble the pagination directives in your template.

```html
<nav
  [(ngpPaginationPage)]="page"
  ngpPagination
  ngpPaginationPageCount="5"
  aria-label="Pagination Navigation"
>
  <ul>
    <li>
      <a ngpPaginationFirst aria-label="First Page">
        <ng-icon name="heroChevronDoubleLeft" />
      </a>
    </li>

    <li>
      <a ngpPaginationPrevious aria-label="Previous Page">
        <ng-icon name="heroChevronLeft" />
      </a>
    </li>

    <li>
      <a ngpPaginationButton ngpPaginationButtonPage="1" aria-label="Page 1">1</a>
    </li>
    <li>
      <a ngpPaginationButton ngpPaginationButtonPage="2" aria-label="Page 2">2</a>
    </li>
    <li>
      <a ngpPaginationButton ngpPaginationButtonPage="3" aria-label="Page 3">3</a>
    </li>
    <li>
      <a ngpPaginationButton ngpPaginationButtonPage="4" aria-label="Page 4">4</a>
    </li>
    <li>
      <a ngpPaginationButton ngpPaginationButtonPage="5" aria-label="Page 5">5</a>
    </li>

    <li>
      <a ngpPaginationNext aria-label="Next Page">
        <ng-icon name="heroChevronRight" />
      </a>
    </li>

    <li>
      <a ngpPaginationLast aria-label="Last Page">
        <ng-icon name="heroChevronDoubleRight" />
      </a>
    </li>
  </ul>
</nav>
```

## Reusable Component

Create a reusable component that uses the pagination directives.

<docs-snippet name="pagination"></docs-snippet>

## Schematics

Generate a reusable pagination component using the Angular CLI.

```bash npm
ng g ng-primitives:primitive pagination
```

### Options

- `path`: The path at which to create the component file.
- `prefix`: The prefix to apply to the generated component selector.
- `component-suffix`: The suffix to apply to the generated component class name.
- `file-suffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `example-styles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/pagination` package:

### NgpPagination

<api-docs name="NgpPagination"></api-docs>

<api-reference-props name="NgpPagination"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-page" description="The current page number." value="number" />
  <api-attribute name="data-page-count" description="The total number of pages." value="number" />
  <api-attribute name="data-disabled" description="Disables the pagination control." value="boolean" />
  <api-attribute name="data-first-page" description="Whether the current page is the first page." value="boolean" />
  <api-attribute name="data-last-page" description="Whether the current page is the last page." value="boolean" />
</api-reference-attributes>

### NgpPaginationButton

<api-docs name="NgpPaginationButton"></api-docs>

<api-reference-props name="NgpPaginationButton"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-page" description="The page number that the button navigates to." value="number" />
  <api-attribute name="data-selected" description="Applied when the button is selected." />
  <api-attribute name="data-hover" description="Applied when the button is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the button is focused." />
  <api-attribute name="data-press" description="Applied when the button is pressed." />
  <api-attribute name="data-disabled" description="Disables the pagination button." />
</api-reference-attributes>

### NgpPaginationFirst

<api-docs name="NgpPaginationFirst"></api-docs>

<api-reference-props name="NgpPaginationFirst"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-first-page" description="Applied when the current page is the first page." />
  <api-attribute name="data-hover" description="Applied when the button is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the button is focused." />
  <api-attribute name="data-press" description="Applied when the button is pressed." />
  <api-attribute name="data-disabled" description="Applied when the button is disabled." />
</api-reference-attributes>

### NgpPaginationPrevious

<api-docs name="NgpPaginationPrevious"></api-docs>

<api-reference-props name="NgpPaginationPrevious"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-first-page" description="Applied when the current page is the first page." />
  <api-attribute name="data-hover" description="Applied when the button is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the button is focused." />
  <api-attribute name="data-press" description="Applied when the button is pressed." />
  <api-attribute name="data-disabled" description="Applied when the button is disabled." />
</api-reference-attributes>

### NgpPaginationNext

<api-docs name="NgpPaginationNext"></api-docs>

<api-reference-props name="NgpPaginationNext"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-last-page" description="Applied when the current page is the last page." />
  <api-attribute name="data-hover" description="Applied when the button is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the button is focused." />
  <api-attribute name="data-press" description="Applied when the button is pressed." />
  <api-attribute name="data-disabled" description="Applied when the button is disabled." />
</api-reference-attributes>

### NgpPaginationLast

<api-docs name="NgpPaginationLast"></api-docs>

<api-reference-props name="NgpPaginationLast"></api-reference-props>

<api-reference-attributes>
  <api-attribute name="data-last-page" description="Applied when the current page is the last page." />
  <api-attribute name="data-hover" description="Applied when the button is hovered." />
  <api-attribute name="data-focus-visible" description="Applied when the button is focused." />
  <api-attribute name="data-press" description="Applied when the button is pressed." />
  <api-attribute name="data-disabled" description="Applied when the button is disabled." />
</api-reference-attributes>

## Accessibility

The pagination container uses `role="navigation"`. The active page button uses `aria-current` to indicate the current page. It is recommended to add an `aria-label` to the navigation element (e.g., "Pagination") for screen reader context.

### Keyboard Interactions

- <kbd>Enter</kbd> / <kbd>Space</kbd>: Activate a pagination button.
