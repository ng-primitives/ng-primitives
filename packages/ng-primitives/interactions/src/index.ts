// re-export ngpInteractions as setupInteractions for backwards compatibility
import { ngpInteractions } from './interactions/interactions';

export { NgpInteractionsConfig, provideInteractionsConfig } from './config/interactions-config';
export { NgpFocusVisible } from './focus-visible/focus-visible';
export { ngpFocusVisibleInteraction } from './focus-visible/focus-visible-interaction';
export { NgpFocus } from './focus/focus';
export { ngpFocusInteraction } from './focus/focus-interaction';
export { NgpHover } from './hover/hover';
export { ngpHoverInteraction } from './hover/hover-interaction';
export { ngpInteractions } from './interactions/interactions';
export { NgpMove, NgpMoveEvent } from './move/move';
export { NgpPress } from './press/press';
export { ngpPressInteraction } from './press/press-interaction';

/**
 * @deprecated use `ngpInteractions` instead
 */
export { ngpInteractions as setupInteractions };
