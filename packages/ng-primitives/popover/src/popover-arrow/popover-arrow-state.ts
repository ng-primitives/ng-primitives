import { NgpOverlayArrowProps, NgpOverlayArrowState, ngpOverlayArrow } from 'ng-primitives/portal';
import { createPrimitive } from 'ng-primitives/state';

// Re-export types with popover-specific aliases
export { NgpOverlayArrowProps as NgpPopoverArrowProps };
export { NgpOverlayArrowState as NgpPopoverArrowState };

export const [
  NgpPopoverArrowStateToken,
  ngpPopoverArrow,
  injectPopoverArrowState,
  providePopoverArrowState,
] = createPrimitive(
  'NgpPopoverArrow',
  ({ padding }: NgpOverlayArrowProps): NgpOverlayArrowState => {
    return ngpOverlayArrow({ padding });
  },
);
