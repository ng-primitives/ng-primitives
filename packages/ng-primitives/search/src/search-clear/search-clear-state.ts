import { inject } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { onChange } from 'ng-primitives/utils';
import { injectSearchState } from '../search/search-state';

export interface NgpSearchClearState {
  /**
   * Clear the search field.
   */
  clear(): void;
}

export const [
  NgpSearchClearStateToken,
  ngpSearchClear,
  injectSearchClearState,
  provideSearchClearState,
] = createPrimitive('NgpSearchClear', (): NgpSearchClearState => {
  const element = injectElementRef<HTMLElement>();
  const search = injectSearchState();

  // Host bindings
  attrBinding(element, 'tabindex', '-1');
  dataBinding(element, 'data-empty', search().empty);

  // An ngpButton on the same element binds the same attributes, so merge the
  // lock into it rather than competing with the consumer's disabled binding.
  const button = inject(NgpButton, { self: true, optional: true });
  const locked = search().disabled;

  if (button) {
    button.registerDisabledSource(locked);
    onDestroy(() => button.unregisterDisabledSource(locked));
  } else {
    // only remove a disabled attribute this part added, so a consumer's own
    // [disabled] binding survives the input unlocking
    let addedDisabled = false;
    onChange(locked, isLocked => {
      const el = element.nativeElement;
      if (isLocked && !el.hasAttribute('disabled')) {
        el.setAttribute('disabled', '');
        addedDisabled = true;
      } else if (!isLocked && addedDisabled) {
        el.removeAttribute('disabled');
        addedDisabled = false;
      }
    });
    dataBinding(element, 'data-disabled', locked);
  }

  function clear(): void {
    search().clear();
  }

  // a soft-disabled (aria-disabled) button still receives clicks
  function onClick(): void {
    if (!element.nativeElement.matches(':disabled, [aria-disabled="true"]')) {
      clear();
    }
  }

  listener(element, 'click', onClick);

  return { clear } satisfies NgpSearchClearState;
});
