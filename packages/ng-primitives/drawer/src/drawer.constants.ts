export const NGP_DRAWER_DATA_ATTRIBUTES = {
  open: 'data-open',
  closed: 'data-closed',
  startingStyle: 'data-starting-style',
  endingStyle: 'data-ending-style',
  expanded: 'data-expanded',
  nested: 'data-nested',
  nestedDrawerOpen: 'data-nested-drawer-open',
  nestedDrawerSwiping: 'data-nested-drawer-swiping',
  swipeDismiss: 'data-swipe-dismiss',
  swipeDirection: 'data-swipe-direction',
  swiping: 'data-swiping',
  disabled: 'data-disabled',
  active: 'data-active',
  inactive: 'data-inactive',
  content: 'data-drawer-content',
  swipeIgnore: 'data-ngp-drawer-swipe-ignore',
} as const;

export type NgpDrawerDataAttribute =
  (typeof NGP_DRAWER_DATA_ATTRIBUTES)[keyof typeof NGP_DRAWER_DATA_ATTRIBUTES];

export const NGP_DRAWER_CSS_VARIABLES = {
  nestedDrawers: '--ngp-drawer-nested-drawers',
  height: '--ngp-drawer-height',
  frontmostHeight: '--ngp-drawer-frontmost-height',
  swipeMovementX: '--ngp-drawer-swipe-movement-x',
  swipeMovementY: '--ngp-drawer-swipe-movement-y',
  snapPointOffset: '--ngp-drawer-snap-point-offset',
  swipeStrength: '--ngp-drawer-swipe-strength',
  swipeProgress: '--ngp-drawer-swipe-progress',
  keyboardInset: '--ngp-drawer-keyboard-inset',
} as const;

export type NgpDrawerCssVariable =
  (typeof NGP_DRAWER_CSS_VARIABLES)[keyof typeof NGP_DRAWER_CSS_VARIABLES];
