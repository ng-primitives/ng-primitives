import { computed, signal, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectPaginationState } from '../pagination/pagination-state';

export interface NgpPaginationFirstState {
  /**
   * Whether the button is disabled, accounting for the parent pagination state.
   */
  readonly disabled: Signal<boolean>;
  /**
   * Go to the first page.
   */
  goToFirstPage(): void;
}

export interface NgpPaginationFirstProps {
  /**
   * Whether the button is disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [
  NgpPaginationFirstStateToken,
  ngpPaginationFirst,
  injectPaginationFirstState,
  providePaginationFirstState,
] = createPrimitive(
  'NgpPaginationFirst',
  ({ disabled: _disabled = signal<boolean>(false) }: NgpPaginationFirstProps) => {
    const elementRef = injectElementRef();
    const paginationState = injectPaginationState();

    const disabled = computed(
      () => _disabled() || paginationState().disabled() || paginationState().firstPage(),
    );

    // Setup interactions
    ngpButton({ disabled: disabled });

    // Host binding
    attrBinding(elementRef, 'tabindex', () => (disabled() ? -1 : 0));
    dataBinding(elementRef, 'data-first-page', () => (paginationState().firstPage() ? '' : null));

    // Listener
    listener(elementRef, 'click', goToFirstPage);
    listener(elementRef, 'keydown.enter', handleOnEnter);
    listener(elementRef, 'keydown.space', handleOnEnter);

    function goToFirstPage(): void {
      if (disabled()) {
        return;
      }

      paginationState().goToPage(1);
    }

    function handleOnEnter(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
      goToFirstPage();
    }

    return {
      disabled,
      goToFirstPage,
    } satisfies NgpPaginationFirstState;
  },
);
