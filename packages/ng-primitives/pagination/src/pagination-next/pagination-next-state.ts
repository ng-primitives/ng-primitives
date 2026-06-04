import { computed, Signal, signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectPaginationState } from '../pagination/pagination-state';

export interface NgpPaginationNextState {
  /** Whether the button is disabled, accounting for the parent pagination state. */
  readonly disabled: Signal<boolean>;
  /** Go to the next page. */
  goToNextPage(): void;
}

export interface NgpPaginationNextProps {
  /** Whether the button is disabled */
  readonly disabled?: Signal<boolean>;
}

export const [
  NgpPaginationNextStateToken,
  ngpPaginationNext,
  injectPaginationNextState,
  providePaginationNextState,
] = createPrimitive(
  'NgpPaginationNext',
  ({ disabled: _disabled = signal<boolean>(false) }: NgpPaginationNextProps) => {
    const elementRef = injectElementRef();
    const paginationState = injectPaginationState();

    const disabled = computed(
      () => _disabled() || paginationState().disabled() || paginationState().lastPage(),
    );

    // Setup interactions
    ngpButton({ disabled: disabled });

    // Host binding
    attrBinding(elementRef, 'tabindex', () => (disabled() ? -1 : 0));
    dataBinding(elementRef, 'data-last-page', () => (paginationState().lastPage() ? '' : null));

    // Listener
    listener(elementRef, 'click', goToNextPage);
    listener(elementRef, 'keydown.enter', handleOnEnter);
    listener(elementRef, 'keydown.space', handleOnEnter);

    function goToNextPage(): void {
      if (disabled()) {
        return;
      }

      paginationState().goToPage(paginationState().page() + 1);
    }

    function handleOnEnter(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
      goToNextPage();
    }

    return {
      disabled,
      goToNextPage,
    } satisfies NgpPaginationNextState;
  },
);
