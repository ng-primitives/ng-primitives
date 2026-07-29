/**
 * The positioning vocabulary the overlay primitives speak, written out in full so the public
 * API (and the generated docs) read as `Ngp*` types rather than re-exported Floating UI ones.
 * `NgpParity` below fails the build if the inlined unions drift from upstream.
 */
import type { Boundary, Middleware, Placement, RootBoundary, Strategy } from '@floating-ui/dom';

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
 * constrain it to a container rather than to its clipping ancestors.
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

type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;

/**
 * Compile-time guard: a Floating UI upgrade that changes any of these types breaks here rather
 * than silently diverging from the inlined copies. Never referenced - existing is the test.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type FloatingUiParity = [
  Assert<Exact<NgpPlacement, Placement>>,
  Assert<Exact<NgpBoundary, Boundary>>,
  Assert<Exact<NgpRootBoundary, RootBoundary>>,
  Assert<Exact<NgpPositioningStrategy, Strategy>>,
];
