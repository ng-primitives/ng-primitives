import { By } from '@angular/platform-browser';
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

const allImports = [
  NgpPagination,
  NgpPaginationButton,
  NgpPaginationFirst,
  NgpPaginationLast,
  NgpPaginationNext,
  NgpPaginationPrevious,
];

describe('NgpPagination', () => {
  describe('roles & attributes', () => {
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
      const { rerender, getByRole, fixture } = await render(
        `<div ngpPagination [ngpPaginationPage]="page" [ngpPaginationPageCount]="pageCount"></div>`,
        {
          imports: [NgpPagination],
          componentProperties: { page: 1, pageCount: 2 },
        },
      );
      await fixture.whenStable();
      let pagination = getByRole('navigation');
      expect(pagination).toHaveAttribute('data-first-page');
      expect(pagination).not.toHaveAttribute('data-last-page');

      await rerender({ componentProperties: { page: 2, pageCount: 2 } });
      await fixture.whenStable();
      pagination = getByRole('navigation');
      expect(pagination).not.toHaveAttribute('data-first-page');
      expect(pagination).toHaveAttribute('data-last-page');
    });

    it('should update data attributes when inputs change', async () => {
      const { rerender, getByRole, fixture } = await render(
        `<div ngpPagination [ngpPaginationPage]="page" [ngpPaginationPageCount]="pageCount" [ngpPaginationDisabled]="disabled"></div>`,
        {
          imports: [NgpPagination],
          componentProperties: { page: 1, pageCount: 2, disabled: false },
        },
      );
      await fixture.whenStable();
      let pagination = getByRole('navigation');
      expect(pagination).toHaveAttribute('data-page', '1');
      expect(pagination).toHaveAttribute('data-page-count', '2');
      expect(pagination).not.toHaveAttribute('data-disabled');

      await rerender({ componentProperties: { page: 2, pageCount: 2, disabled: true } });
      await fixture.whenStable();
      pagination = getByRole('navigation');
      expect(pagination).toHaveAttribute('data-page', '2');
      expect(pagination).toHaveAttribute('data-page-count', '2');
      expect(pagination).toHaveAttribute('data-disabled');
    });
  });

  describe('page navigation via NgpPaginationButton', () => {
    it('should emit pageChange and update the page when a page button is clicked', async () => {
      const onPageChange = vi.fn();
      const { getByRole, getByTestId, fixture } = await render(
        `<div
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
      expect(pagination).toHaveAttribute('data-page', '1');

      fireEvent.click(getByTestId('go-to-page-3'));
      await fixture.whenStable();

      expect(onPageChange).toHaveBeenCalledWith(3);
      expect(pagination).toHaveAttribute('data-page', '3');
      expect(pagination).not.toHaveAttribute('data-first-page');
      expect(pagination).not.toHaveAttribute('data-last-page');
    });

    it('should stay uncontrolled when the page binding is explicitly undefined', async () => {
      const { getByRole } = await render(
        `<div ngpPagination [ngpPaginationPage]="page" [ngpPaginationDefaultPage]="3" [ngpPaginationPageCount]="5">
          <button data-testid="page-2" ngpPaginationButton ngpPaginationButtonPage="2">2</button>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationButton],
          componentProperties: { page: undefined },
        },
      );

      // an explicit `undefined` must not coerce to NaN — it stays uncontrolled at the default page
      expect(getByRole('navigation')).toHaveAttribute('data-page', '3');
    });

    it('should fall back to the declared default page when defaultPage is explicitly undefined', async () => {
      const { getByRole } = await render(
        `<div ngpPagination [ngpPaginationDefaultPage]="page" [ngpPaginationPageCount]="5">
          <button data-testid="page-2" ngpPaginationButton ngpPaginationButtonPage="2">2</button>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationButton],
          componentProperties: { page: undefined },
        },
      );

      // a bound-undefined default must resolve to the declared default (1), not NaN
      expect(getByRole('navigation')).toHaveAttribute('data-page', '1');
    });

    it('should mark the active page button with data-selected and aria-current', async () => {
      const { getByTestId, fixture } = await render(
        `<div ngpPagination [ngpPaginationPage]="2" [ngpPaginationPageCount]="3">
          <button data-testid="page-1" ngpPaginationButton ngpPaginationButtonPage="1">1</button>
          <button data-testid="page-2" ngpPaginationButton ngpPaginationButtonPage="2">2</button>
        </div>`,
        { imports: [NgpPagination, NgpPaginationButton] },
      );
      await fixture.whenStable();

      expect(getByTestId('page-2')).toHaveAttribute('data-selected', '');
      expect(getByTestId('page-1')).not.toHaveAttribute('data-selected');
      expect(getByTestId('page-2')).toHaveAttribute('data-page', '2');

      // the active item exposes aria-current="page"; inactive items omit it
      expect(getByTestId('page-2')).toHaveAttribute('aria-current', 'page');
      expect(getByTestId('page-1')).not.toHaveAttribute('aria-current');
    });

    it('should navigate with Enter and Space keydown on non-button controls', async () => {
      const { getByRole, getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
          <a data-testid="first-page-button" ngpPaginationFirst>First</a>
          <a data-testid="previous-page-button" ngpPaginationPrevious>Previous</a>
          <a data-testid="go-to-page-4" ngpPaginationButton ngpPaginationButtonPage="4">Go to Page 4</a>
          <a data-testid="next-page-button" ngpPaginationNext>Next</a>
          <a data-testid="last-page-button" ngpPaginationLast>Last</a>
        </div>`,
        {
          imports: allImports,
          componentProperties: { page: 3 },
        },
      );
      const pagination = getByRole('navigation');
      expect(pagination).toHaveAttribute('data-page', '3');

      fireEvent.keyDown(getByTestId('first-page-button'), { key: 'Enter' });
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '1');

      fireEvent.keyDown(getByTestId('next-page-button'), { key: 'Enter' });
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '2');

      fireEvent.keyDown(getByTestId('go-to-page-4'), { key: ' ' });
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '4');

      fireEvent.keyDown(getByTestId('previous-page-button'), { key: ' ' });
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '3');

      fireEvent.keyDown(getByTestId('last-page-button'), { key: 'Enter' });
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '5');
    });

    it('should ignore repeated keydown events', async () => {
      const { getByRole, getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
          <a data-testid="previous-page-button" ngpPaginationPrevious>Previous</a>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationPrevious],
          componentProperties: { page: 3 },
        },
      );
      const pagination = getByRole('navigation');
      const previous = getByTestId('previous-page-button');
      expect(pagination).toHaveAttribute('data-page', '3');

      fireEvent.keyDown(previous, { key: 'Enter' });
      fireEvent.keyDown(previous, { key: 'Enter', repeat: true });
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '2');
    });

    it('should ignore keys other than Enter and Space', async () => {
      const { getByRole, getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
          <a data-testid="next-page-button" ngpPaginationNext>Next</a>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationNext],
          componentProperties: { page: 2 },
        },
      );
      const pagination = getByRole('navigation');
      fireEvent.keyDown(getByTestId('next-page-button'), { key: 'ArrowRight' });
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '2');
    });
  });

  describe('first / last / next / previous', () => {
    it('should navigate to the first page when the first button is clicked', async () => {
      const { getByRole, getByTestId, fixture } = await render(
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
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '1');
    });

    it('should navigate to the last page when the last button is clicked', async () => {
      const { getByRole, getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
          <button data-testid="last-page-button" ngpPaginationLast>Last</button>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationLast],
          componentProperties: { page: 3 },
        },
      );
      const pagination = getByRole('navigation');
      fireEvent.click(getByTestId('last-page-button'));
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '5');
    });

    it('should step forwards and backwards with next and previous', async () => {
      const { getByRole, getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
          <button data-testid="previous-page-button" ngpPaginationPrevious>Previous</button>
          <button data-testid="next-page-button" ngpPaginationNext>Next</button>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationNext, NgpPaginationPrevious],
          componentProperties: { page: 3 },
        },
      );
      const pagination = getByRole('navigation');

      fireEvent.click(getByTestId('next-page-button'));
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '4');

      fireEvent.click(getByTestId('previous-page-button'));
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '3');
    });

    it('should expose data-first-page / data-last-page on the boundary buttons', async () => {
      const { getByTestId, fixture } = await render(
        `<div ngpPagination [ngpPaginationPage]="1" [ngpPaginationPageCount]="5">
          <button data-testid="previous-page-button" ngpPaginationPrevious>Previous</button>
          <button data-testid="first-page-button" ngpPaginationFirst>First</button>
          <button data-testid="next-page-button" ngpPaginationNext>Next</button>
          <button data-testid="last-page-button" ngpPaginationLast>Last</button>
        </div>`,
        { imports: allImports },
      );
      await fixture.whenStable();

      expect(getByTestId('previous-page-button')).toHaveAttribute('data-first-page', '');
      expect(getByTestId('first-page-button')).toHaveAttribute('data-first-page', '');
      expect(getByTestId('next-page-button')).not.toHaveAttribute('data-last-page');
      expect(getByTestId('last-page-button')).not.toHaveAttribute('data-last-page');
    });
  });

  describe('disabled at boundaries', () => {
    it('should disable the first and previous buttons on the first page', async () => {
      const { getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
          <button data-testid="first-page-button" ngpPaginationFirst>First</button>
          <button data-testid="previous-page-button" ngpPaginationPrevious>Previous</button>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationFirst, NgpPaginationPrevious],
          componentProperties: { page: 1 },
        },
      );
      await fixture.whenStable();

      expect(getByTestId('first-page-button')).toHaveAttribute('data-disabled');
      expect(getByTestId('first-page-button')).toHaveAttribute('disabled');
      expect(getByTestId('first-page-button')).toHaveAttribute('tabindex', '-1');
      expect(getByTestId('previous-page-button')).toHaveAttribute('data-disabled');
      expect(getByTestId('previous-page-button')).toHaveAttribute('disabled');
      expect(getByTestId('previous-page-button')).toHaveAttribute('tabindex', '-1');
    });

    it('should disable the last and next buttons on the last page', async () => {
      const { getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5">
          <button data-testid="last-page-button" ngpPaginationLast>Last</button>
          <button data-testid="next-page-button" ngpPaginationNext>Next</button>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationLast, NgpPaginationNext],
          componentProperties: { page: 5 },
        },
      );
      await fixture.whenStable();

      expect(getByTestId('last-page-button')).toHaveAttribute('data-disabled');
      expect(getByTestId('last-page-button')).toHaveAttribute('disabled');
      expect(getByTestId('next-page-button')).toHaveAttribute('data-disabled');
      expect(getByTestId('next-page-button')).toHaveAttribute('disabled');
    });

    it('should enable the first and previous buttons once off the first page', async () => {
      const { getByTestId, fixture } = await render(
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
      await fixture.whenStable();

      expect(getByTestId('previous-page-button')).toHaveAttribute('disabled');

      fireEvent.click(getByTestId('next-page-button'));
      await fixture.whenStable();

      expect(getByTestId('previous-page-button')).not.toHaveAttribute('data-disabled');
      expect(getByTestId('previous-page-button')).not.toHaveAttribute('disabled');
      expect(getByTestId('first-page-button')).not.toHaveAttribute('data-disabled');
      expect(getByTestId('first-page-button')).not.toHaveAttribute('disabled');
    });

    it('should not navigate past the last page with next', async () => {
      const onPageChange = vi.fn();
      const { getByRole, getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5" (ngpPaginationPageChange)="onPageChange($event)">
          <button data-testid="next-page-button" ngpPaginationNext>Next</button>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationNext],
          componentProperties: { page: 5, onPageChange },
        },
      );
      await fixture.whenStable();

      fireEvent.click(getByTestId('next-page-button'));
      await fixture.whenStable();

      expect(onPageChange).not.toHaveBeenCalled();
      expect(getByRole('navigation')).toHaveAttribute('data-page', '5');
    });

    it('should not navigate before the first page with previous', async () => {
      const onPageChange = vi.fn();
      const { getByRole, getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5" (ngpPaginationPageChange)="onPageChange($event)">
          <button data-testid="previous-page-button" ngpPaginationPrevious>Previous</button>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationPrevious],
          componentProperties: { page: 1, onPageChange },
        },
      );
      await fixture.whenStable();

      fireEvent.click(getByTestId('previous-page-button'));
      await fixture.whenStable();

      expect(onPageChange).not.toHaveBeenCalled();
      expect(getByRole('navigation')).toHaveAttribute('data-page', '1');
    });
  });

  describe('disabled pagination', () => {
    it('should disable every control when the pagination is disabled', async () => {
      const { getByTestId, fixture } = await render(
        `<div ngpPagination [ngpPaginationPage]="3" [ngpPaginationPageCount]="5" [ngpPaginationDisabled]="true">
          <button data-testid="first-page-button" ngpPaginationFirst>First</button>
          <button data-testid="previous-page-button" ngpPaginationPrevious>Previous</button>
          <button data-testid="page-3" ngpPaginationButton ngpPaginationButtonPage="3">3</button>
          <button data-testid="next-page-button" ngpPaginationNext>Next</button>
          <button data-testid="last-page-button" ngpPaginationLast>Last</button>
        </div>`,
        { imports: allImports },
      );
      await fixture.whenStable();

      for (const id of [
        'first-page-button',
        'previous-page-button',
        'page-3',
        'next-page-button',
        'last-page-button',
      ]) {
        expect(getByTestId(id)).toHaveAttribute('disabled');
        expect(getByTestId(id)).toHaveAttribute('data-disabled');
        expect(getByTestId(id)).toHaveAttribute('tabindex', '-1');
      }
    });

    it('should not respond to clicks while disabled', async () => {
      const onPageChange = vi.fn();
      const { getByRole, getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5" [ngpPaginationDisabled]="true" (ngpPaginationPageChange)="onPageChange($event)">
          <a data-testid="go-to-page-2" ngpPaginationButton ngpPaginationButtonPage="2">2</a>
          <a data-testid="next-page-button" ngpPaginationNext>Next</a>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationButton, NgpPaginationNext],
          componentProperties: { page: 1, onPageChange },
        },
      );
      await fixture.whenStable();

      fireEvent.click(getByTestId('go-to-page-2'));
      fireEvent.click(getByTestId('next-page-button'));
      await fixture.whenStable();

      expect(onPageChange).not.toHaveBeenCalled();
      expect(getByRole('navigation')).toHaveAttribute('data-page', '1');
    });

    it('should not respond to keyboard while disabled', async () => {
      const onPageChange = vi.fn();
      const { getByRole, getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5" [ngpPaginationDisabled]="true" (ngpPaginationPageChange)="onPageChange($event)">
          <a data-testid="next-page-button" ngpPaginationNext>Next</a>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationNext],
          componentProperties: { page: 1, onPageChange },
        },
      );
      await fixture.whenStable();

      fireEvent.keyDown(getByTestId('next-page-button'), { key: 'Enter' });
      await fixture.whenStable();

      expect(onPageChange).not.toHaveBeenCalled();
      expect(getByRole('navigation')).toHaveAttribute('data-page', '1');
    });

    it('should expose aria-disabled on non-button controls while disabled', async () => {
      const { getByTestId, fixture } = await render(
        `<div ngpPagination [ngpPaginationPage]="3" [ngpPaginationPageCount]="5" [ngpPaginationDisabled]="true">
          <a data-testid="next-page-button" ngpPaginationNext>Next</a>
        </div>`,
        { imports: [NgpPagination, NgpPaginationNext] },
      );
      await fixture.whenStable();

      expect(getByTestId('next-page-button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('should re-evaluate button tabindex when pagination disabled changes', async () => {
      const { getByTestId, rerender, fixture } = await render(
        `<div ngpPagination [ngpPaginationPage]="page" [ngpPaginationPageCount]="5" [ngpPaginationDisabled]="disabled">
          <button data-testid="next-page-button" ngpPaginationNext>Next</button>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationNext],
          componentProperties: { page: 2, disabled: false },
        },
      );
      const next = getByTestId('next-page-button');
      await fixture.whenStable();
      expect(next).toHaveAttribute('tabindex', '0');

      await rerender({ componentProperties: { page: 2, disabled: true } });
      await fixture.whenStable();
      expect(next).toHaveAttribute('tabindex', '-1');
    });

    it('should honour a per-button disabled input', async () => {
      const onPageChange = vi.fn();
      const { getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5" (ngpPaginationPageChange)="onPageChange($event)">
          <a data-testid="go-to-page-2" ngpPaginationButton ngpPaginationButtonPage="2" ngpPaginationButtonDisabled>2</a>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationButton],
          componentProperties: { page: 1, onPageChange },
        },
      );
      await fixture.whenStable();

      expect(getByTestId('go-to-page-2')).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(getByTestId('go-to-page-2'));
      await fixture.whenStable();

      expect(onPageChange).not.toHaveBeenCalled();
    });
  });

  describe('boundaries & clamping', () => {
    it('should not navigate to an out-of-bounds page via a page button', async () => {
      const onPageChange = vi.fn();
      const { getByRole, getByTestId, fixture } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="2" (ngpPaginationPageChange)="onPageChange($event)">
          <button data-testid="go-to-page-3" ngpPaginationButton ngpPaginationButtonPage="3">Go to Page 3</button>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationButton],
          componentProperties: { page: 1, onPageChange },
        },
      );
      await fixture.whenStable();

      fireEvent.click(getByTestId('go-to-page-3'));
      await fixture.whenStable();

      expect(onPageChange).not.toHaveBeenCalled();
      expect(getByRole('navigation')).toHaveAttribute('data-page', '1');
    });

    it('should treat a controlled page above the page count as the last page', async () => {
      const { getByRole, fixture } = await render(
        `<div ngpPagination [ngpPaginationPage]="10" [ngpPaginationPageCount]="5"></div>`,
        { imports: [NgpPagination] },
      );
      await fixture.whenStable();

      // the raw page is reflected, but the boundary flag stays correct so a "Next"
      // button is treated as at-the-end (page 10 >= pageCount 5)
      const pagination = getByRole('navigation');
      expect(pagination).toHaveAttribute('data-page', '10');
      expect(pagination).toHaveAttribute('data-last-page', '');
    });

    it('should treat a page below one as the first page', async () => {
      const { getByRole, fixture } = await render(
        `<div ngpPagination ngpPaginationDefaultPage="0" ngpPaginationPageCount="5"></div>`,
        { imports: [NgpPagination] },
      );
      await fixture.whenStable();

      // the raw page is reflected, but the boundary flag stays correct so a
      // "Previous" button is treated as at-the-start (page 0 <= 1)
      const pagination = getByRole('navigation');
      expect(pagination).toHaveAttribute('data-page', '0');
      expect(pagination).toHaveAttribute('data-first-page', '');
    });
  });

  describe('uncontrolled mode', () => {
    it('should navigate seeded from defaultPage', async () => {
      const { getByRole, getByTestId, fixture } = await render(
        `<div ngpPagination ngpPaginationDefaultPage="1" ngpPaginationPageCount="5">
          <button data-testid="next-page-button" ngpPaginationNext>Next</button>
        </div>`,
        { imports: [NgpPagination, NgpPaginationNext] },
      );
      const pagination = getByRole('navigation');
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '1');

      fireEvent.click(getByTestId('next-page-button'));
      await fixture.whenStable();
      expect(pagination).toHaveAttribute('data-page', '2');
    });

    it('should not drift a controlled page on interaction', async () => {
      const onPageChange = vi.fn();
      const { getByRole, getByTestId, fixture } = await render(
        `<div ngpPagination [ngpPaginationPage]="page" [ngpPaginationPageCount]="5" (ngpPaginationPageChange)="onPageChange($event)">
          <button data-testid="next-page-button" ngpPaginationNext>Next</button>
        </div>`,
        {
          imports: [NgpPagination, NgpPaginationNext],
          componentProperties: { page: 2, onPageChange },
        },
      );
      await fixture.whenStable();

      fireEvent.click(getByTestId('next-page-button'));
      await fixture.whenStable();

      // the change is reported, but a controlled page stays put until the parent
      // updates the binding
      expect(onPageChange).toHaveBeenCalledWith(3);
      expect(getByRole('navigation')).toHaveAttribute('data-page', '2');
    });
  });

  describe('directive API', () => {
    it('should navigate through the NgpPagination.goToPage() method', async () => {
      const onPageChange = vi.fn();
      const { fixture, getByRole } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5" (ngpPaginationPageChange)="onPageChange($event)"></div>`,
        {
          imports: [NgpPagination],
          componentProperties: { page: 1, onPageChange },
        },
      );

      const pagination = fixture.debugElement
        .query(By.directive(NgpPagination))
        .injector.get(NgpPagination);

      pagination.goToPage(4);
      await fixture.whenStable();

      expect(onPageChange).toHaveBeenCalledWith(4);
      expect(getByRole('navigation')).toHaveAttribute('data-page', '4');
    });

    it('should ignore an out-of-bounds page through goToPage()', async () => {
      const onPageChange = vi.fn();
      const { fixture, getByRole } = await render(
        `<div ngpPagination [(ngpPaginationPage)]="page" [ngpPaginationPageCount]="5" (ngpPaginationPageChange)="onPageChange($event)"></div>`,
        {
          imports: [NgpPagination],
          componentProperties: { page: 1, onPageChange },
        },
      );

      const pagination = fixture.debugElement
        .query(By.directive(NgpPagination))
        .injector.get(NgpPagination);

      pagination.goToPage(99);
      pagination.goToPage(0);
      await fixture.whenStable();

      expect(onPageChange).not.toHaveBeenCalled();
      expect(getByRole('navigation')).toHaveAttribute('data-page', '1');
    });
  });
});
