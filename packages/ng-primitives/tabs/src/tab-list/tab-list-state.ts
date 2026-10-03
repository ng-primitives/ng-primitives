import { signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { attrBinding, createPrimitive, dataBinding } from 'ng-primitives/state';
import { injectTabsetState } from '../tabset/tabset-state';

/**
 * The state for the NgpTabList directive.
 */
export interface NgpTabListState {
  // No public methods exposed for tab list
}

/**
 * The props for the NgpTabList state.
 */
export interface NgpTabListProps {
  // No props for tab list
}

export const [NgpTabListStateToken, ngpTabList, injectTabListState, provideTabListState] =
  createPrimitive('NgpTabList', ({}: NgpTabListProps) => {
    const element = injectElementRef();
    const tabsetState = injectTabsetState();

    ngpRovingFocusGroup({
      orientation: tabsetState().orientation,
      disabled: signal(false),
      wrap: tabsetState().wrap,
      homeEnd: signal(true),
      inherit: false,
    });

    // Host bindings
    attrBinding(element, 'role', 'tablist');
    attrBinding(element, 'aria-orientation', () => tabsetState().orientation());
    dataBinding(element, 'data-orientation', () => tabsetState().orientation());

    return {} satisfies NgpTabListState;
  });
