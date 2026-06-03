import { computed, ElementRef, signal, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectPaginationState } from '../pagination/pagination-state';

export interface NgpPaginationPreviousState {
  /** Access the element's reference. */
  readonly elementRef: ElementRef;
  /**
   * Whether the button is disabled.
   */
  readonly buttonDisabled: Signal<boolean>;
  /**
   * Whether the button is disabled.
   */
  readonly disabled: Signal<boolean>;
  /**
   * Go to the first page.
   */
  goToPreviousPage(): void;
}

export interface NgpPaginationPreviousProps {
  /**
   * Whether the button is disabled.
   */
  readonly buttonDisabled: Signal<boolean>;
}

export const [
  NgpPaginationPreviousStateToken,
  ngpPaginationPrevious,
  injectPaginationPreviousState,
  providePaginationPreviousState,
] = createPrimitive(
  'NgpPaginationPrevious',
  ({ buttonDisabled = signal<boolean>(false) }: NgpPaginationPreviousProps) => {
    const elementRef = injectElementRef();
    const paginationState = injectPaginationState();

    const disabled = computed(
      () => buttonDisabled() || paginationState().disabled() || paginationState().firstPage(),
    );

    // Setup interactions
    ngpButton({ disabled: disabled });

    // Host binding
    attrBinding(elementRef, 'tabindex', () => (disabled() ? -1 : 0));
    dataBinding(elementRef, 'data-first-page', () => (paginationState().firstPage() ? '' : null));

    // Listener
    listener(elementRef, 'click', goToPreviousPage);
    listener(elementRef, 'keydown.enter', handleOnEnter);
    listener(elementRef, 'keydown.space', handleOnEnter);

    function goToPreviousPage(): void {
      if (disabled()) {
        return;
      }

      paginationState().goToPage(paginationState().page() - 1);
    }

    function handleOnEnter(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
      goToPreviousPage();
    }

    return {
      elementRef,
      buttonDisabled,
      disabled,
      goToPreviousPage,
    } satisfies NgpPaginationPreviousState;
  },
);
