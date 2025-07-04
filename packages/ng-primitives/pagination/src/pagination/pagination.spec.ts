import { fireEvent, render } from '@testing-library/angular';
import {
  NgpPagination,
  NgpPaginationButton,
  NgpPaginationFirst,
  NgpPaginationLast,
} from 'ng-primitives/pagination';

describe('NgpPagination', () => {
  it('should initialise correctly with defaults', async () => {
    const { getByRole } = await render(`<div ngpPagination></div>`, {
      imports: [NgpPagination],
    });
    const pagination = getByRole('navigation');
    expect(pagination.getAttribute('role')).toBe('navigation');
    expect(pagination.getAttribute('data-page')).toBe('1');
    expect(pagination.getAttribute('data-page-count')).toBe('0');
    expect(pagination.hasAttribute('data-first-page')).toBe(true);
    expect(pagination.hasAttribute('data-last-page')).toBe(false);
    expect(pagination.hasAttribute('data-disabled')).toBe(false);
  });

  it('should reflect input values as data attributes', async () => {
    const { getByRole } = await render(
      `<div ngpPagination [ngpPaginationPage]="3" [ngpPaginationPageCount]="5" [ngpPaginationDisabled]="true"></div>`,
      {
        imports: [NgpPagination],
      },
    );
    const pagination = getByRole('navigation');
    expect(pagination.getAttribute('data-page')).toBe('3');
    expect(pagination.getAttribute('data-page-count')).toBe('5');
    expect(pagination.hasAttribute('data-disabled')).toBe(true);
    expect(pagination.hasAttribute('data-first-page')).toBe(false);
    expect(pagination.hasAttribute('data-last-page')).toBe(false);
  });

  it('should set data-first-page and data-last-page correctly', async () => {
    const { rerender, getByRole } = await render(
      `<div ngpPagination [ngpPaginationPage]="page" [ngpPaginationPageCount]="pageCount"></div>`,
      {
        imports: [NgpPagination],
        componentProperties: {
          page: 1,
          pageCount: 2,
        },
      },
    );
    let pagination = getByRole('navigation');
    expect(pagination.hasAttribute('data-first-page')).toBe(true);
    expect(pagination.hasAttribute('data-last-page')).toBe(false);

    // rerender with new @Input values using the second argument
    await rerender({
      componentProperties: {
        page: 2,
        pageCount: 2,
      },
    });
    pagination = getByRole('navigation');
    expect(pagination.hasAttribute('data-first-page')).toBe(false);
    expect(pagination.hasAttribute('data-last-page')).toBe(true);
  });

  it('should emit pageChange when goToPage is called', async () => {
    const onPageChange = jest.fn();

    const { getByRole, getByTestId } = await render(
      `
      <div
          [(ngpPaginationPage)]="page"
          [ngpPaginationPageCount]="5"
          (ngpPaginationPageChange)="onPageChange($event)"
          ngpPagination
        >
        <button data-testid="go-to-page-3" ngpPaginationButton ngpPaginationButtonPage="3">Go to Page 3</button>
      </div>`,
      {
        imports: [NgpPagination, NgpPaginationButton],
        componentProperties: {
          page: 1,
          onPageChange,
        },
      },
    );

    const pagination = getByRole('navigation');
    const goToPageButton = getByTestId('go-to-page-3');
    expect(pagination.getAttribute('data-page')).toBe('1');
    expect(pagination.getAttribute('data-page-count')).toBe('5');
    expect(pagination.hasAttribute('data-first-page')).toBe(true);
    expect(pagination.hasAttribute('data-last-page')).toBe(false);

    fireEvent.click(goToPageButton);
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(pagination.getAttribute('data-page')).toBe('3');
    expect(pagination.hasAttribute('data-first-page')).toBe(false);
    expect(pagination.hasAttribute('data-last-page')).toBe(false);
  });

  it('should not emit pageChange or update page if goToPage is called with out-of-bounds value', async () => {
    const { getByRole, getByTestId } = await render(
      `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="2">
        <button data-testid="go-to-page-3" ngpPaginationButton ngpPaginationButtonPage="3">Go to Page 3</button>
      </div>`,
      {
        imports: [NgpPagination],
        componentProperties: {
          page: 1,
        },
      },
    );
    const pagination = getByRole('navigation');
    const goToPageButton = getByTestId('go-to-page-3');
    fireEvent.click(goToPageButton);
    expect(pagination.getAttribute('data-page')).toBe('1');
  });

  it('should update data attributes when inputs change', async () => {
    const { rerender, getByRole } = await render(
      `<div ngpPagination [ngpPaginationPage]="page" [ngpPaginationPageCount]="pageCount" [ngpPaginationDisabled]="disabled"></div>`,
      {
        imports: [NgpPagination],
        componentProperties: {
          page: 1,
          pageCount: 2,
          disabled: false,
        },
      },
    );
    let pagination = getByRole('navigation');
    expect(pagination.getAttribute('data-page')).toBe('1');
    expect(pagination.getAttribute('data-page-count')).toBe('2');
    expect(pagination.hasAttribute('data-disabled')).toBe(false);

    await rerender({
      componentProperties: {
        page: 2,
        pageCount: 2,
        disabled: true,
      },
    });
    pagination = getByRole('navigation');
    expect(pagination.getAttribute('data-page')).toBe('2');
    expect(pagination.getAttribute('data-page-count')).toBe('2');
    expect(pagination.hasAttribute('data-disabled')).toBe(true);
  });

  it('should navigate to the first page when first button is clicked', async () => {
    const { getByRole, getByTestId } = await render(
      `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
        <button data-testid="first-page-button" ngpPaginationFirst>First</button>
      </div>`,
      {
        imports: [NgpPagination, NgpPaginationFirst],
        componentProperties: {
          page: 3,
        },
      },
    );
    const pagination = getByRole('navigation');
    const firstPageButton = getByTestId('first-page-button');
    expect(pagination.getAttribute('data-page')).toBe('3');

    fireEvent.click(firstPageButton);
    expect(pagination.getAttribute('data-page')).toBe('1');
  });

  it('should navigate to the last page when last button is clicked', async () => {
    const { getByRole, getByTestId } = await render(
      `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
        <button data-testid="last-page-button" ngpPaginationLast>Last</button>
      </div>`,
      {
        imports: [NgpPagination, NgpPaginationLast],
        componentProperties: {
          page: 3,
        },
      },
    );
    const pagination = getByRole('navigation');
    const lastPageButton = getByTestId('last-page-button');
    expect(pagination.getAttribute('data-page')).toBe('3');

    fireEvent.click(lastPageButton);
    expect(pagination.getAttribute('data-page')).toBe('5');
  });
});
