/**
 * The positioning vocabulary the overlay primitives speak, aliased so the public API is
 * expressed in `Ngp*` names rather than Floating UI's. Aliases, not copies - a hand-written
 * duplicate of a structural type silently drifts when the upstream one changes. Where we add
 * to the vocabulary, the alias is widened rather than replaced, so it still tracks upstream.
 */
import type { Boundary, Middleware, Placement, RootBoundary, Strategy } from '@floating-ui/dom';

/** Where a floating element is placed relative to its trigger, e.g. `bottom-start`. */
export type NgpPlacement = Placement;

/**
 * Floating UI resolves `'clippingAncestors'` from the *floating* element. A panel portalled
 * to the body has none worth speaking of, so an overlay whose trigger sits in a scroll
 * container measures against the viewport and never learns the container is the real
 * constraint. This resolves them from the trigger instead.
 * @see https://github.com/ng-primitives/ng-primitives/issues/689
 */
export type NgpTriggerClippingAncestors = 'triggerClippingAncestors';

/**
 * The clipping area a floating element is kept within. Pass an element (or elements) to
 * constrain it to a container, or `'triggerClippingAncestors'` to constrain it to whatever
 * scrolls the trigger.
 */
export type NgpBoundary = Boundary | NgpTriggerClippingAncestors;

/** The root clipping area a floating element is kept within. */
export type NgpRootBoundary = RootBoundary;

/**
 * How a floating element is positioned in the document. Named for positioning to keep it
 * distinct from `ScrollStrategy`, which governs what happens when the page scrolls.
 */
export type NgpPositioningStrategy = Strategy;

/** A positioning middleware that can be appended to the overlay's own pipeline. */
export type NgpMiddleware = Middleware;
