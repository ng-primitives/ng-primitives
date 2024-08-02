---
name: 'Pagination'
---

# Pagination

The Pagination primitives provide a set of directives to create a pagination control. The pagination control is used to navigate through a set of data that is split into multiple pages.

<docs-example name="pagination"></docs-example>

## Import

Import the Pagination primitives from `ng-primitives/pagination`.

```ts
import { NgpPagination } from 'ng-primitives/pagination';
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

## API Reference

The following directives are available to import from the `ng-primitives/pagination` package:

### NgpPagination

The `NgpPagination` directive is used to create a pagination control.

- Selector: `[ngpPagination]`
- Exported As: `ngpPagination`

<response-field name="ngpPaginationPage" type="number">
  The current page number.
</response-field>

<response-field name="ngpPaginationPageCount" type="number">
  The total number of pages.
</response-field>

<response-field name="ngpPaginationPageChange" type="EventEmitter<number>">
  Emits the new page number when the page changes.
</response-field>

<response-field name="ngpPaginationDisabled" type="boolean">
  Disables the pagination control.
</response-field>

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

The `NgpPaginationButton` directive is used to create a pagination button.

- Selector: `[ngpPaginationButton]`
- Exported As: `ngpPaginationButton`
- Host Directives: [NgpButton](/primitives/button)

<response-field name="ngpPaginationButtonPage" type="number">
  The page number that the button navigates to.
</response-field>

<response-field name="ngpPaginationButtonDisabled" type="boolean">
  Disables the pagination button.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpPaginationButton` directive:

| Attribute            | Description                                   | Value             |
| -------------------- | --------------------------------------------- | ----------------- |
| `data-selected`      | Whether the button is selected.               | `true` \| `false` |
| `data-page`          | The page number that the button navigates to. | `number`          |
| `data-hover`         | The hover state of the button.                | `true` \| `false` |
| `data-focus-visible` | The focus state of the button.                | `true` \| `false` |
| `data-press`         | The pressed state of the button.              | `true` \| `false` |
| `data-disabled`      | The disabled state of the button.             | `true` \| `false` |

### NgpPaginationFirst

The `NgpPaginationFirst` directive is used to create a pagination button that navigates to the first page.

- Selector: `[ngpPaginationFirst]`
- Exported As: `ngpPaginationFirst`
- Host Directives: [NgpButton](/primitives/button)

<response-field name="ngpPaginationFirstDisabled" type="boolean">
  Disables the pagination button.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpPaginationFirst` directive:

| Attribute            | Description                                 | Value             |
| -------------------- | ------------------------------------------- | ----------------- |
| `data-first-page`    | Whether the current page is the first page. | `true` \| `false` |
| `data-hover`         | The hover state of the button.              | `true` \| `false` |
| `data-focus-visible` | The focus state of the button.              | `true` \| `false` |
| `data-press`         | The pressed state of the button.            | `true` \| `false` |
| `data-disabled`      | The disabled state of the button.           | `true` \| `false` |

### NgpPaginationPrevious

The `NgpPaginationPrevious` directive is used to create a pagination button that navigates to the previous page.

- Selector: `[ngpPaginationPrevious]`
- Exported As: `ngpPaginationPrevious`
- Host Directives: [NgpButton](/primitives/button)

<response-field name="ngpPaginationPreviousDisabled" type="boolean">
  Disables the pagination button.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpPaginationPrevious` directive:

| Attribute            | Description                                 | Value             |
| -------------------- | ------------------------------------------- | ----------------- |
| `data-first-page`    | Whether the current page is the first page. | `true` \| `false` |
| `data-hover`         | The hover state of the button.              | `true` \| `false` |
| `data-focus-visible` | The focus state of the button.              | `true` \| `false` |
| `data-press`         | The pressed state of the button.            | `true` \| `false` |
| `data-disabled`      | The disabled state of the button.           | `true` \| `false` |

### NgpPaginationNext

The `NgpPaginationNext` directive is used to create a pagination button that navigates to the next page.

- Selector: `[ngpPaginationNext]`
- Exported As: `ngpPaginationNext`
- Host Directives: [NgpButton](/primitives/button)

<response-field name="ngpPaginationNextDisabled" type="boolean">
  Disables the pagination button.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpPaginationNext` directive:

| Attribute            | Description                                | Value             |
| -------------------- | ------------------------------------------ | ----------------- |
| `data-last-page`     | Whether the current page is the last page. | `true` \| `false` |
| `data-hover`         | The hover state of the button.             | `true` \| `false` |
| `data-focus-visible` | The focus state of the button.             | `true` \| `false` |
| `data-press`         | The pressed state of the button.           | `true` \| `false` |
| `data-disabled`      | The disabled state of the button.          | `true` \| `false` |

### NgpPaginationLast

The `NgpPaginationLast` directive is used to create a pagination button that navigates to the last page.

- Selector: `[ngpPaginationLast]`
- Exported As: `ngpPaginationLast`
- Host Directives: [NgpButton](/primitives/button)

<response-field name="ngpPaginationLastDisabled" type="boolean">
  Disables the pagination button.
</response-field>

#### Data Attributes

The following data attributes are applied to the `ngpPaginationLast` directive:

| Attribute            | Description                                | Value             |
| -------------------- | ------------------------------------------ | ----------------- |
| `data-last-page`     | Whether the current page is the last page. | `true` \| `false` |
| `data-hover`         | The hover state of the button.             | `true` \| `false` |
| `data-focus-visible` | The focus state of the button.             | `true` \| `false` |
| `data-press`         | The pressed state of the button.           | `true` \| `false` |
| `data-disabled`      | The disabled state of the button.          | `true` \| `false` |
