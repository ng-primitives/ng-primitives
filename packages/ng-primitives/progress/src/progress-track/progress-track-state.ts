import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding } from 'ng-primitives/state';
import { injectProgressState } from '../progress/progress-state';

export interface NgpProgressTrackState {}

export interface NgpProgressTrackProps {}

export const [
  NgpProgressTrackStateToken,
  ngpProgressTrack,
  injectProgressTrackState,
  provideProgressTrackState,
] = createPrimitive('NgpProgressTrack', ({}: NgpProgressTrackProps) => {
  const element = injectElementRef();
  const state = injectProgressState();

  dataBinding(element, 'data-progressing', () => (state().progressing() ? '' : null));
  dataBinding(element, 'data-indeterminate', () => (state().indeterminate() ? '' : null));
  dataBinding(element, 'data-complete', () => (state().complete() ? '' : null));

  return {};
});
