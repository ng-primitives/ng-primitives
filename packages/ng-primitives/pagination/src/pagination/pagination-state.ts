import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlledState,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  SetterOptions,
} from 'ng-primitives/state';
import { Observable } from 'rxjs';

export interface NgpPaginationState {
  /**
   * The currently selected page.
   */
  readonly page: WritableSignal<number>;
  /**
   * The total number of pages.
   */
  readonly pageCount: Signal<number>;
  /**
   * Whether the pagination is disabled.
   */
  readonly disabled: Signal<boolean>;
  /**
   * Determine if we are on the first page.
   * @internal
   */
  readonly firstPage: Signal<boolean>;
  /**
   * Determine if we are on the last page.
   * @internal
   */
  readonly lastPage: Signal<boolean>;
  /**
   * The event that is fired when the page changes.
   */
  readonly pageChange: Observable<number>;
  /**
   * Set the current page directly (no bounds navigation logic).
   * @param page The page to set.
   * @param options Setter options, e.g. `{ emit: false }` to suppress change emission.
   */
  setPage: (page: number, options?: SetterOptions) => void;
  /**
   * Go to the specified page.
   * @param page The page to go to.
   */
  goToPage: (page: number) => void;
}

export interface NgpPaginationProps {
  /**
   * The currently selected page. When `undefined`, the pagination is uncontrolled
   * and seeds from `defaultPage`.
   */
  readonly page?: Signal<number | undefined>;
  /**
   * The default page for uncontrolled usage.
   */
  readonly defaultPage?: Signal<number>;
  /**
   * The total number of pages.
   */
  readonly pageCount?: Signal<number>;
  /**
   * Whether the pagination is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /** Callback fired when the page state changes. */
  onPageChange: (page: number) => void;
}

export const [
  NgpPaginationStateToken,
  ngpPagination,
  injectPaginationState,
  providePaginationState,
] = createPrimitive(
  'NgpPagination',
  ({
    page: _page = signal<number | undefined>(undefined),
    defaultPage: _defaultPage = signal<number>(1),
    pageCount: _pageCount = signal<number>(0),
    disabled: _disabled = signal<boolean>(false),
    onPageChange,
  }: NgpPaginationProps) => {
    const elementRef = injectElementRef();

    const [page, setPage, pageChange] = controlledState({
      value: _page,
      defaultValue: _defaultPage,
      onChange: onPageChange,
    });

    // use <= / >= so the boundary flags stay correct even if the bound page is
    // out of range (otherwise a Next/Previous button can stay enabled past the end)
    const firstPage = computed(() => page() <= 1);
    const lastPage = computed(() => _pageCount() > 0 && page() >= _pageCount());

    // Host bindings
    attrBinding(elementRef, 'role', 'navigation');
    dataBinding(elementRef, 'data-page', () => page().toString());
    dataBinding(elementRef, 'data-page-count', () => _pageCount().toString());
    dataBinding(elementRef, 'data-first-page', () => (firstPage() ? '' : null));
    dataBinding(elementRef, 'data-last-page', () => (lastPage() ? '' : null));
    dataBinding(elementRef, 'data-disabled', () => (_disabled() ? '' : null));

    function goToPage(page: number) {
      // check if the page is within the bounds of the pagination
      if (page < 1 || page > _pageCount()) {
        return;
      }

      setPage(page);
    }

    return {
      page: deprecatedSetter(page, 'setPage', setPage),
      pageCount: _pageCount,
      pageChange,
      disabled: _disabled,
      firstPage,
      lastPage,
      setPage,
      goToPage,
    } satisfies NgpPaginationState;
  },
);
