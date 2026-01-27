import { NgpOverlayArrowProps, NgpOverlayArrowState, ngpOverlayArrow } from 'ng-primitives/portal';
import { createPrimitive } from 'ng-primitives/state';

// Re-export types with tooltip-specific aliases
export { NgpOverlayArrowProps as NgpTooltipArrowProps };
export { NgpOverlayArrowState as NgpTooltipArrowState };

export const [
  NgpTooltipArrowStateToken,
  ngpTooltipArrow,
  injectTooltipArrowState,
  provideTooltipArrowState,
] = createPrimitive(
  'NgpTooltipArrow',
  ({ padding }: NgpOverlayArrowProps): NgpOverlayArrowState => {
    return ngpOverlayArrow({ padding });
  },
);
