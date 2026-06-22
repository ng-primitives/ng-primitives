import { createPrimitive } from 'ng-primitives/state';

export interface NgpDialogPanelState {}

export interface NgpDialogPanelProps {}

export const [
  NgpDialogPanelStateToken,
  ngpDialogPanel,
  injectDialogPanelState,
  provideDialogPanelState,
] = createPrimitive('NgpDialogPanel', ({}: NgpDialogPanelProps) => {
  return {} satisfies NgpDialogPanelState;
});
