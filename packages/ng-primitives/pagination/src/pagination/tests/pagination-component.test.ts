import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './pagination-forms.fixture';

describe('Pagination (reusable component) — standalone', () => {
  it('renders a button per page plus the nav controls', async () => {
    const { getByRole } = await render(`<app-pagination pageCount="3"></app-pagination>`, {
      imports: [Pagination],
    });

    expect(getByRole('button', { name: 'First Page' })).toBeTruthy();
    expect(getByRole('button', { name: 'Previous Page' })).toBeTruthy();
    expect(getByRole('button', { name: 'Page 1' })).toBeTruthy();
    expect(getByRole('button', { name: 'Page 2' })).toBeTruthy();
    expect(getByRole('button', { name: 'Page 3' })).toBeTruthy();
    expect(getByRole('button', { name: 'Next Page' })).toBeTruthy();
    expect(getByRole('button', { name: 'Last Page' })).toBeTruthy();
  });

  it('starts on the first page and disables first/previous', async () => {
    const { getByRole, fixture } = await render(`<app-pagination pageCount="3"></app-pagination>`, {
      imports: [Pagination],
    });
    await fixture.whenStable();

    expect(getByRole('navigation')).toHaveAttribute('data-page', '1');
    expect(getByRole('button', { name: 'First Page' })).toHaveAttribute('disabled');
    expect(getByRole('button', { name: 'Previous Page' })).toHaveAttribute('disabled');
    expect(getByRole('button', { name: 'Next Page' })).not.toHaveAttribute('disabled');
  });

  it('navigates to a specific page on click', async () => {
    const pageChange = vi.fn();
    const { getByRole, fixture } = await render(
      `<app-pagination pageCount="5" (pageChange)="pageChange($event)"></app-pagination>`,
      { imports: [Pagination], componentProperties: { pageChange } },
    );
    await fixture.whenStable();

    fireEvent.click(getByRole('button', { name: 'Page 4' }));
    await fixture.whenStable();

    expect(pageChange).toHaveBeenCalledWith(4);
    expect(getByRole('navigation')).toHaveAttribute('data-page', '4');
    expect(getByRole('button', { name: 'Page 4' })).toHaveAttribute('data-selected', '');
  });

  it('steps through pages with next/previous and disables at the ends', async () => {
    const { getByRole, fixture } = await render(`<app-pagination pageCount="3"></app-pagination>`, {
      imports: [Pagination],
    });
    await fixture.whenStable();

    fireEvent.click(getByRole('button', { name: 'Next Page' }));
    await fixture.whenStable();
    expect(getByRole('navigation')).toHaveAttribute('data-page', '2');

    fireEvent.click(getByRole('button', { name: 'Next Page' }));
    await fixture.whenStable();
    expect(getByRole('navigation')).toHaveAttribute('data-page', '3');
    expect(getByRole('button', { name: 'Next Page' })).toHaveAttribute('disabled');
    expect(getByRole('button', { name: 'Last Page' })).toHaveAttribute('disabled');

    fireEvent.click(getByRole('button', { name: 'Previous Page' }));
    await fixture.whenStable();
    expect(getByRole('navigation')).toHaveAttribute('data-page', '2');
  });

  it('jumps to the last and first page', async () => {
    const { getByRole, fixture } = await render(`<app-pagination pageCount="7"></app-pagination>`, {
      imports: [Pagination],
    });
    await fixture.whenStable();

    fireEvent.click(getByRole('button', { name: 'Last Page' }));
    await fixture.whenStable();
    expect(getByRole('navigation')).toHaveAttribute('data-page', '7');

    fireEvent.click(getByRole('button', { name: 'First Page' }));
    await fixture.whenStable();
    expect(getByRole('navigation')).toHaveAttribute('data-page', '1');
  });

  it('disables every control when the pagination is disabled', async () => {
    const pageChange = vi.fn();
    const { getByRole, fixture } = await render(
      `<app-pagination pageCount="5" [disabled]="true" (pageChange)="pageChange($event)"></app-pagination>`,
      { imports: [Pagination], componentProperties: { pageChange } },
    );
    await fixture.whenStable();

    fireEvent.click(getByRole('button', { name: 'Page 3' }));
    fireEvent.click(getByRole('button', { name: 'Next Page' }));
    await fixture.whenStable();

    expect(pageChange).not.toHaveBeenCalled();
    expect(getByRole('button', { name: 'Page 3' })).toHaveAttribute('disabled');
    expect(getByRole('navigation')).toHaveAttribute('data-page', '1');
  });
});
