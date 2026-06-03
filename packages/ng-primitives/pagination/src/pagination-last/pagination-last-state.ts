import { computed, ElementRef, signal, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectPaginationState } from '../pagination/pagination-state';

export interface NgpPaginationLastState {
  /** Access the element's reference. */
  readonly elementRef: ElementRef;
  /** Whether the button is disabled. */
  readonly buttonDisabled: Signal<boolean>;
  /** Whether the button is disabled. */
  readonly disabled: Signal<boolean>;
  /** Go to the last page. */
  goToLastPage(): void;
}

export interface NgpPaginationLastProps {
  /** Whether the button is disabled. */
  readonly buttonDisabled: Signal<boolean>;
}

export const [
  NgpPaginationLastStateToken,
  ngpPaginationLast,
  injectPaginationLastState,
  providePaginationLastState,
] = createPrimitive(
  'NgpPaginationLast',
  ({ buttonDisabled = signal<boolean>(false) }: NgpPaginationLastProps) => {
    const elementRef = injectElementRef();
    const paginationState = injectPaginationState();

    const disabled = computed(
      () => buttonDisabled() || paginationState().disabled() || paginationState().lastPage(),
    );

    // Setup interactions
    ngpButton({ disabled: disabled });

    // Host binding
    attrBinding(elementRef, 'tabindex', () => (disabled() ? -1 : 0));
    dataBinding(elementRef, 'data-last-page', () => (paginationState().lastPage() ? '' : null));

    // Listener
    listener(elementRef, 'click', goToLastPage);
    listener(elementRef, 'keydown.enter', handleOnEnter);
    listener(elementRef, 'keydown.space', handleOnEnter);

    function goToLastPage(): void {
      if (disabled()) {
        return;
      }

      paginationState().goToPage(paginationState().pageCount());
    }

    function handleOnEnter(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
      goToLastPage();
    }

    return {
      elementRef,
      buttonDisabled,
      disabled,
      goToLastPage,
    } satisfies NgpPaginationLastState;
  },
);
