import { fireEvent, render } from '@testing-library/angular';
import {
  NgpPagination,
  NgpPaginationButton,
  NgpPaginationFirst,
  NgpPaginationLast,
  NgpPaginationNext,
  NgpPaginationPrevious,
} from 'ng-primitives/pagination';
import { describe, expect, it, vi } from 'vitest';

describe('NgpPagination', () => {
  it('should initialise correctly with defaults', async () => {
    const { getByRole } = await render(`<div ngpPagination></div>`, {
      imports: [NgpPagination],
    });
    const pagination = getByRole('navigation');
    expect(pagination).toHaveAttribute('role', 'navigation');
    expect(pagination).toHaveAttribute('data-page', '1');
    expect(pagination).toHaveAttribute('data-page-count', '0');
    expect(pagination).toHaveAttribute('data-first-page');
    expect(pagination).not.toHaveAttribute('data-last-page');
    expect(pagination).not.toHaveAttribute('data-disabled');
  });

  it('should reflect input values as data attributes', async () => {
    const { getByRole } = await render(
      `<div ngpPagination [ngpPaginationPage]="3" [ngpPaginationPageCount]="5" [ngpPaginationDisabled]="true"></div>`,
      { imports: [NgpPagination] },
    );
    const pagination = getByRole('navigation');
    expect(pagination).toHaveAttribute('data-page', '3');
    expect(pagination).toHaveAttribute('data-page-count', '5');
    expect(pagination).toHaveAttribute('data-disabled');
    expect(pagination).not.toHaveAttribute('data-first-page');
    expect(pagination).not.toHaveAttribute('data-last-page');
  });

  it('should set data-first-page and data-last-page correctly', async () => {
    const { rerender, getByRole } = await render(
      `<div ngpPagination [ngpPaginationPage]="page" [ngpPaginationPageCount]="pageCount"></div>`,
      {
        imports: [NgpPagination],
        componentProperties: { page: 1, pageCount: 2 },
      },
    );
    let pagination = getByRole('navigation');
    expect(pagination).toHaveAttribute('data-first-page');
    expect(pagination).not.toHaveAttribute('data-last-page');

    await rerender({ componentProperties: { page: 2, pageCount: 2 } });
    pagination = getByRole('navigation');
    expect(pagination).not.toHaveAttribute('data-first-page');
    expect(pagination).toHaveAttribute('data-last-page');
  });

  it('should emit pageChange when goToPage is called', async () => {
    const onPageChange = vi.fn();

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
        componentProperties: { page: 1, onPageChange },
      },
    );

    const pagination = getByRole('navigation');
    const goToPageButton = getByTestId('go-to-page-3');
    expect(pagination).toHaveAttribute('data-page', '1');
    expect(pagination).toHaveAttribute('data-page-count', '5');
    expect(pagination).toHaveAttribute('data-first-page');
    expect(pagination).not.toHaveAttribute('data-last-page');

    fireEvent.click(goToPageButton);
    expect(onPageChange).toHaveBeenCalledWith(3);
    expect(pagination).toHaveAttribute('data-page', '3');
    expect(pagination).not.toHaveAttribute('data-first-page');
    expect(pagination).not.toHaveAttribute('data-last-page');
  });

  it('should not emit pageChange or update page if goToPage is called with out-of-bounds value', async () => {
    const { getByRole, getByTestId } = await render(
      `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="2">
        <button data-testid="go-to-page-3" ngpPaginationButton ngpPaginationButtonPage="3">Go to Page 3</button>
      </div>`,
      {
        imports: [NgpPagination, NgpPaginationButton],
        componentProperties: { page: 1 },
      },
    );
    const pagination = getByRole('navigation');
    const goToPageButton = getByTestId('go-to-page-3');
    fireEvent.click(goToPageButton);
    expect(pagination).toHaveAttribute('data-page', '1');
  });

  it('should update data attributes when inputs change', async () => {
    const { rerender, getByRole } = await render(
      `<div ngpPagination [ngpPaginationPage]="page" [ngpPaginationPageCount]="pageCount" [ngpPaginationDisabled]="disabled"></div>`,
      {
        imports: [NgpPagination],
        componentProperties: { page: 1, pageCount: 2, disabled: false },
      },
    );
    let pagination = getByRole('navigation');
    expect(pagination).toHaveAttribute('data-page', '1');
    expect(pagination).toHaveAttribute('data-page-count', '2');
    expect(pagination).not.toHaveAttribute('data-disabled');

    await rerender({ componentProperties: { page: 2, pageCount: 2, disabled: true } });
    pagination = getByRole('navigation');
    expect(pagination).toHaveAttribute('data-page', '2');
    expect(pagination).toHaveAttribute('data-page-count', '2');
    expect(pagination).toHaveAttribute('data-disabled');
  });

  it('should navigate to the first page when first button is clicked', async () => {
    const { getByRole, getByTestId } = await render(
      `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
        <button data-testid="first-page-button" ngpPaginationFirst>First</button>
      </div>`,
      {
        imports: [NgpPagination, NgpPaginationFirst],
        componentProperties: { page: 3 },
      },
    );
    const pagination = getByRole('navigation');
    expect(pagination).toHaveAttribute('data-page', '3');

    fireEvent.click(getByTestId('first-page-button'));
    expect(pagination).toHaveAttribute('data-page', '1');
  });

  it('should navigate to the last page when last button is clicked', async () => {
    const { getByRole, getByTestId } = await render(
      `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
        <button data-testid="last-page-button" ngpPaginationLast>Last</button>
      </div>`,
      {
        imports: [NgpPagination, NgpPaginationLast],
        componentProperties: { page: 3 },
      },
    );
    const pagination = getByRole('navigation');
    expect(pagination).toHaveAttribute('data-page', '3');

    fireEvent.click(getByTestId('last-page-button'));
    expect(pagination).toHaveAttribute('data-page', '5');
  });

  it('should disable the first and previous buttons when on the first page', async () => {
    const { getByTestId } = await render(
      `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
        <button data-testid="first-page-button" ngpPaginationFirst>First</button>
        <button data-testid="previous-page-button" ngpPaginationPrevious>Previous</button>
      </div>`,
      {
        imports: [NgpPagination, NgpPaginationFirst, NgpPaginationPrevious],
        componentProperties: { page: 1 },
      },
    );

    expect(getByTestId('first-page-button')).toHaveAttribute('data-disabled');
    expect(getByTestId('first-page-button')).toHaveAttribute('disabled');
    expect(getByTestId('previous-page-button')).toHaveAttribute('data-disabled');
    expect(getByTestId('previous-page-button')).toHaveAttribute('disabled');
  });

  it('should disable the last and next buttons when on the last page', async () => {
    const { getByTestId } = await render(
      `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
        <button data-testid="last-page-button" ngpPaginationLast>Last</button>
        <button data-testid="next-page-button" ngpPaginationNext>Next</button>
      </div>`,
      {
        imports: [NgpPagination, NgpPaginationLast, NgpPaginationNext],
        componentProperties: { page: 5 },
      },
    );

    expect(getByTestId('last-page-button')).toHaveAttribute('data-disabled');
    expect(getByTestId('last-page-button')).toHaveAttribute('disabled');
    expect(getByTestId('next-page-button')).toHaveAttribute('data-disabled');
    expect(getByTestId('next-page-button')).toHaveAttribute('disabled');
  });

  it('should enable the first and previous buttons when not on the first page', async () => {
    const { getByTestId } = await render(
      `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
        <button data-testid="first-page-button" ngpPaginationFirst>First</button>
        <button data-testid="previous-page-button" ngpPaginationPrevious>Previous</button>
        <button data-testid="next-page-button" ngpPaginationNext>Next</button>
      </div>`,
      {
        imports: [NgpPagination, NgpPaginationFirst, NgpPaginationPrevious, NgpPaginationNext],
        componentProperties: { page: 1 },
      },
    );

    expect(getByTestId('first-page-button')).toHaveAttribute('data-disabled');
    expect(getByTestId('first-page-button')).toHaveAttribute('disabled');
    expect(getByTestId('previous-page-button')).toHaveAttribute('data-disabled');
    expect(getByTestId('previous-page-button')).toHaveAttribute('disabled');

    fireEvent.click(getByTestId('next-page-button'));
    expect(getByTestId('previous-page-button')).not.toHaveAttribute('data-disabled');
    expect(getByTestId('previous-page-button')).not.toHaveAttribute('disabled');
    expect(getByTestId('first-page-button')).not.toHaveAttribute('data-disabled');
    expect(getByTestId('first-page-button')).not.toHaveAttribute('disabled');
  });

  it('should enable the last and next buttons when not on the last page', async () => {
    const { getByTestId } = await render(
      `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
        <button data-testid="previous-page-button" ngpPaginationPrevious>Previous</button>
        <button data-testid="last-page-button" ngpPaginationLast>Last</button>
        <button data-testid="next-page-button" ngpPaginationNext>Next</button>
      </div>`,
      {
        imports: [NgpPagination, NgpPaginationLast, NgpPaginationNext, NgpPaginationPrevious],
        componentProperties: { page: 5 },
      },
    );

    expect(getByTestId('last-page-button')).toHaveAttribute('data-disabled');
    expect(getByTestId('last-page-button')).toHaveAttribute('disabled');
    expect(getByTestId('next-page-button')).toHaveAttribute('data-disabled');
    expect(getByTestId('next-page-button')).toHaveAttribute('disabled');

    fireEvent.click(getByTestId('previous-page-button'));
    expect(getByTestId('next-page-button')).not.toHaveAttribute('data-disabled');
    expect(getByTestId('next-page-button')).not.toHaveAttribute('disabled');
    expect(getByTestId('last-page-button')).not.toHaveAttribute('data-disabled');
    expect(getByTestId('last-page-button')).not.toHaveAttribute('disabled');
  });
});
