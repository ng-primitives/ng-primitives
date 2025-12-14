import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding } from 'ng-primitives/state';
import { injectProgressState } from '../progress/progress-state';

export interface NgpProgressValueState {}

export interface NgpProgressValueProps {}

export const [NgpProgressValueStateToken, ngpProgressValue] = createPrimitive(
  'NgpProgressValue',
  ({}: NgpProgressValueProps) => {
    const element = injectElementRef();

    const state = injectProgressState();
    // Host bindings using helper functions
    attrBinding(element, 'aria-hidden', 'true');
    dataBinding(element, 'data-progressing', () => (state().progressing() ? '' : null));
    dataBinding(element, 'data-indeterminate', () => (state().indeterminate() ? '' : null));
    dataBinding(element, 'data-complete', () => (state().complete() ? '' : null));

    return {};
  },
);
