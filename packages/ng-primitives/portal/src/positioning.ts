/**
 * The positioning vocabulary the overlay primitives speak, aliased so the public API is
 * expressed in `Ngp*` names rather than Floating UI's. Aliases, not copies - a hand-written
 * duplicate of a structural type silently drifts when the upstream one changes.
 */
import type { Boundary, Middleware, Placement, RootBoundary, Strategy } from '@floating-ui/dom';

/** Where a floating element is placed relative to its trigger, e.g. `bottom-start`. */
export type NgpPlacement = Placement;

/**
 * The clipping area a floating element is kept within. Pass an element (or elements) to
 * constrain it to a container rather than to its clipping ancestors.
 */
export type NgpBoundary = Boundary;

/** The root clipping area a floating element is kept within. */
export type NgpRootBoundary = RootBoundary;

/**
 * How a floating element is positioned in the document. Named for positioning to keep it
 * distinct from `ScrollStrategy`, which governs what happens when the page scrolls.
 */
export type NgpPositioningStrategy = Strategy;

/** A positioning middleware that can be appended to the overlay's own pipeline. */
export type NgpMiddleware = Middleware;
