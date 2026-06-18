import { computed, signal, Signal } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectPaginationState } from '../pagination/pagination-state';

export interface NgpPaginationButtonState {
  /**
   * Define the page this button represents.
   */
  readonly page: Signal<number>;
  /**
   * Whether the button is disabled, accounting for the parent pagination state.
   */
  readonly disabled: Signal<boolean>;
  /**
   * Go to the page this button represents.
   */
  goToPage(): void;
}

export interface NgpPaginationButtonProps {
  /**
   * Define the page this button represents.
   */
  readonly page?: Signal<number>;
  /**
   * Whether the button is disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [
  NgpPaginationButtonStateToken,
  ngpPaginationButton,
  injectPaginationButtonState,
  providePaginationButtonState,
] = createPrimitive(
  'NgpPaginationButton',
  ({
    page = signal<number>(-1),
    disabled: _disabled = signal<boolean>(false),
  }: NgpPaginationButtonProps) => {
    const elementRef = injectElementRef();
    const paginationState = injectPaginationState();

    const selected = computed(() => page() === paginationState().page());
    const disabled = computed(() => _disabled() || paginationState().disabled());

    // Setup interactions
    ngpButton({ disabled: disabled });

    // Host binding
    attrBinding(elementRef, 'tabindex', () => (disabled() ? -1 : 0));
    attrBinding(elementRef, 'aria-current', selected);
    dataBinding(elementRef, 'data-page', () => page().toString());
    dataBinding(elementRef, 'data-selected', () => (selected() ? '' : null));

    // Listeners
    listener(elementRef, 'click', goToPage);
    listener(elementRef, 'keydown.space', handleOnEnter);
    listener(elementRef, 'keydown.enter', handleOnEnter);

    function goToPage(): void {
      if (disabled()) {
        return;
      }

      paginationState().goToPage(page());
    }

    function handleOnEnter(event: Event): void {
      event.preventDefault();
      event.stopPropagation();
      goToPage();
    }

    return {
      page,
      disabled,
      goToPage,
    } satisfies NgpPaginationButtonState;
  },
);
