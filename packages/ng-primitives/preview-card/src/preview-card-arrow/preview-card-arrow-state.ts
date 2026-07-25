import { createPrimitive } from 'ng-primitives/state';

export interface NgpPreviewCardArrowState {}

export interface NgpPreviewCardArrowProps {}

export const [
  NgpPreviewCardArrowStateToken,
  ngpPreviewCardArrow,
  injectPreviewCardArrowState,
  providePreviewCardArrowState,
] = createPrimitive('NgpPreviewCardArrow', ({}: NgpPreviewCardArrowProps) => {
  return {} satisfies NgpPreviewCardArrowState;
});
