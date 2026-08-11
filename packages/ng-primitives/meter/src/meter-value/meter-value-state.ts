import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive } from 'ng-primitives/state';

export interface NgpMeterValueState {}

export interface NgpMeterValueProps {}

export const [NgpMeterValueStateToken, ngpMeterValue] = createPrimitive(
  'NgpMeterValue',
  ({}: NgpMeterValueProps) => {
    const element = injectElementRef();

    attrBinding(element, 'aria-hidden', 'true');

    return {} satisfies NgpMeterValueState;
  },
);
