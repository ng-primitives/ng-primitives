/**
 * A position for programmatic overlay positioning.
 * When provided to an overlay, it will be positioned at these coordinates
 * instead of being anchored to a trigger element.
 */
export interface NgpPosition {
  /** Client X coordinate */
  x: number;
  /** Client Y coordinate */
  y: number;
}
