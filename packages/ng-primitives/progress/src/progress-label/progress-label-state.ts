import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, onDestroy } from 'ng-primitives/state';
import { onChange, uniqueId } from 'ng-primitives/utils';
import { injectProgressState } from '../progress/progress-state';

export interface NgpProgressLabelState {}

export interface NgpProgressLabelProps {
  /**
   * The unique identifier for the progress label.
   */
  readonly id?: Signal<string>;
}

export const [NgpProgressLabelStateToken, ngpProgressLabel] = createPrimitive(
  'NgpProgressLabel',
  ({ id = signal(uniqueId('ngp-progress-label')) }: NgpProgressLabelProps) => {
    const element = injectElementRef();

    const state = injectProgressState();

    attrBinding(element, 'id', id);
    attrBinding(element, 'for', element.nativeElement.tagName === 'LABEL' ? state().id?.() : null);
    dataBinding(element, 'data-progressing', () => state().progressing());
    dataBinding(element, 'data-indeterminate', () => state().indeterminate());
    dataBinding(element, 'data-complete', () => state().complete());

    // Keep the progress `aria-labelledby` in sync with the label id. On teardown the
    // label removes itself so `aria-labelledby` never points at an element that has
    // been removed from the DOM.
    onChange(id, (currentId, previousId) => {
      if (previousId) {
        state().removeLabel(previousId);
      }
      state().setLabel(currentId);
    });

    onDestroy(() => state().removeLabel(id()));

    return {} satisfies NgpProgressLabelState;
  },
);
