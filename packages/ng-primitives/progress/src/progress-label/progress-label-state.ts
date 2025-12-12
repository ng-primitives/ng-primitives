import { Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding } from 'ng-primitives/state';
import { injectProgressState } from '../progress/progress-state';

export interface NgpProgressLabelState {}

export interface NgpProgressLabelProps {
  /**
   * The unique identifier for the progress label.
   */
  readonly id: Signal<string>;
}

export const [
  NgpProgressLabelStateToken,
  ngpProgressLabel,
  injectProgressLabelState,
  provideProgressLabelState,
] = createPrimitive('NgpProgressLabel', ({ ...props }: NgpProgressLabelProps) => {
  const element = injectElementRef();

  const state = injectProgressState();
  state().label.set(props);

  attrBinding(element, 'id', props.id);
  attrBinding(element, 'for', element.nativeElement.tagName === 'LABEL' ? state().id?.() : null);
  dataBinding(element, 'data-progressing', () => (state().progressing() ? '' : null));
  dataBinding(element, 'data-indeterminate', () => (state().indeterminate() ? '' : null));
  dataBinding(element, 'data-complete', () => (state().complete() ? '' : null));

  return {};
});
