import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding } from 'ng-primitives/state';
import { injectDateControllerState } from '../date-picker/date-picker-state';

export interface NgpDatePickerGridState {}

export interface NgpDatePickerGridProps {}

export const [
  NgpDatePickerGridStateToken,
  ngpDatePickerGrid,
  injectDatePickerGridState,
  provideDatePickerGridState,
] = createPrimitive(
  'NgpDatePickerGrid',
  <T>({}: NgpDatePickerGridProps): NgpDatePickerGridState => {
    const elementRef = injectElementRef();
    const state = injectDateControllerState<T>();

    // Host bindings
    attrBinding(elementRef, 'role', 'grid');
    attrBinding(elementRef, 'aria-labelledby', () => state().labelledBy() ?? null);
    dataBinding(elementRef, 'data-disabled', () => (state().disabled() ? '' : null));

    return {} satisfies NgpDatePickerGridState;
  },
);
