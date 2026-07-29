/**
 * The positioning vocabulary the overlay primitives speak, written out in full so the public
 * API (and the generated docs) read as `Ngp*` types rather than re-exported Floating UI ones.
 * `positioning.test-d.ts` fails if a copy drifts from the Floating UI type it mirrors.
 */
import type { Middleware } from '@floating-ui/dom';

/** Where a floating element is placed relative to its trigger, e.g. `bottom-start`. */
export type NgpPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end';

/** A rectangle in viewport coordinates. */
export interface NgpRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The clipping area a floating element is kept within. Pass an element (or elements) to
 * constrain it to a container rather than to its clipping ancestors, or an `NgpRect` to
 * constrain it to an arbitrary region.
 */
export type NgpBoundary = 'clippingAncestors' | Element | Element[] | NgpRect;

/** The root clipping area a floating element is kept within. */
export type NgpRootBoundary = 'viewport' | 'document' | NgpRect;

/**
 * How a floating element is positioned in the document. Named for positioning to keep it
 * distinct from `ScrollStrategy`, which governs what happens when the page scrolls.
 */
export type NgpPositioningStrategy = 'absolute' | 'fixed';

/**
 * A positioning middleware that can be appended to the overlay's own pipeline. Still an alias -
 * inlining it would mean copying Floating UI's whole middleware state surface.
 */
export type NgpMiddleware = Middleware;
