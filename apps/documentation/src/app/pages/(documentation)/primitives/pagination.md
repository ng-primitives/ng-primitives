---
name: 'Pagination'
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
- `componentSuffix`: The suffix to apply to the generated component class name.
- `fileSuffix`: The suffix to apply to the generated component file name. Defaults to `component`.
- `exampleStyles`: Whether to include example styles in the generated component file. Defaults to `true`.

## API Reference

The following directives are available to import from the `ng-primitives/pagination` package:

### NgpPagination

<api-docs name="NgpPagination"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpPagination` directive:

| Attribute         | Description                                 | Value     |
| ----------------- | ------------------------------------------- | --------- |
| `data-page`       | The current page number.                    | `number`  |
| `data-page-count` | The total number of pages.                  | `number`  |
| `data-disabled`   | Disables the pagination control.            | `boolean` |
| `data-first-page` | Whether the current page is the first page. | `boolean` |
| `data-last-page`  | Whether the current page is the last page.  | `boolean` |

### NgpPaginationButton

<api-docs name="NgpPaginationButton"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpPaginationButton` directive:

| Attribute            | Description                                   | Value    |
| -------------------- | --------------------------------------------- | -------- |
| `data-page`          | The page number that the button navigates to. | `number` |
| `data-selected`      | Applied when the button is selected.          | `-`      |
| `data-hover`         | Applied when the button is hovered.           | `-`      |
| `data-focus-visible` | Applied when the button is focused.           | `-`      |
| `data-press`         | Applied when the button is pressed.           | `-`      |
| `data-disabled`      | Disables the pagination button.               | `-`      |

### NgpPaginationFirst

<api-docs name="NgpPaginationFirst"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpPaginationFirst` directive:

| Attribute            | Description                                      |
| -------------------- | ------------------------------------------------ |
| `data-first-page`    | Applied when the current page is the first page. |
| `data-hover`         | Applied when the button is hovered.              |
| `data-focus-visible` | Applied when the button is focused.              |
| `data-press`         | Applied when the button is pressed.              |
| `data-disabled`      | Applied when the button is disabled.             |

### NgpPaginationPrevious

<api-docs name="NgpPaginationPrevious"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpPaginationPrevious` directive:

| Attribute            | Description                                      |
| -------------------- | ------------------------------------------------ |
| `data-first-page`    | Applied when the current page is the first page. |
| `data-hover`         | Applied when the button is hovered.              |
| `data-focus-visible` | Applied when the button is focused.              |
| `data-press`         | Applied when the button is pressed.              |
| `data-disabled`      | Applied when the button is disabled.             |

### NgpPaginationNext

<api-docs name="NgpPaginationNext"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpPaginationNext` directive:

| Attribute            | Description                                     |
| -------------------- | ----------------------------------------------- |
| `data-last-page`     | Applied when the current page is the last page. |
| `data-hover`         | Applied when the button is hovered.             |
| `data-focus-visible` | Applied when the button is focused.             |
| `data-press`         | Applied when the button is pressed.             |
| `data-disabled`      | Applied when the button is disabled.            |

### NgpPaginationLast

<api-docs name="NgpPaginationLast"></api-docs>

#### Data Attributes

The following data attributes are applied to the `ngpPaginationLast` directive:

| Attribute            | Description                                     |
| -------------------- | ----------------------------------------------- |
| `data-last-page`     | Applied when the current page is the last page. |
| `data-hover`         | Applied when the button is hovered.             |
| `data-focus-visible` | Applied when the button is focused.             |
| `data-press`         | Applied when the button is pressed.             |
| `data-disabled`      | Applied when the button is disabled.            |
