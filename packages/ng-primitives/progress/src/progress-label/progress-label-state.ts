import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
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

    state().labelId.set(id());

    return {} satisfies NgpProgressLabelState;
  },
);
