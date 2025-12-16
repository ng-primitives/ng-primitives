import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding } from 'ng-primitives/state';
import { injectProgressState } from '../progress/progress-state';

export interface NgpProgressTrackState {}

export interface NgpProgressTrackProps {}

export const [NgpProgressTrackStateToken, ngpProgressTrack] = createPrimitive(
  'NgpProgressTrack',
  ({}: NgpProgressTrackProps) => {
    const element = injectElementRef();
    const state = injectProgressState();

    dataBinding(element, 'data-progressing', () => state().progressing());
    dataBinding(element, 'data-indeterminate', () => state().indeterminate());
    dataBinding(element, 'data-complete', () => state().complete());

    return {};
  },
);
