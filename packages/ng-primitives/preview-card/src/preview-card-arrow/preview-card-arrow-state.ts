import { NgpOverlayArrowProps, NgpOverlayArrowState, ngpOverlayArrow } from 'ng-primitives/portal';
import { createPrimitive } from 'ng-primitives/state';

// Re-export types with preview-card-specific aliases
export { NgpOverlayArrowProps as NgpPreviewCardArrowProps };
export { NgpOverlayArrowState as NgpPreviewCardArrowState };

export const [
  NgpPreviewCardArrowStateToken,
  ngpPreviewCardArrow,
  injectPreviewCardArrowState,
  providePreviewCardArrowState,
] = createPrimitive(
  'NgpPreviewCardArrow',
  ({ padding }: NgpOverlayArrowProps): NgpOverlayArrowState => {
    return ngpOverlayArrow({ padding });
  },
);
