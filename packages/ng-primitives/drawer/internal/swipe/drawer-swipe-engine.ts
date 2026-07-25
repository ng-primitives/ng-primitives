/* Adapted from Base UI useSwipeDismiss at c33f4210 (MIT, Material UI SAS). */
import { NgpDrawerSwipeDirection } from '../../drawer.types';
import {
  DrawerSwipeVector,
  getCrossAxisDisplacement,
  getSwipeDisplacement,
  movementForDirection,
} from './direction';
import { DrawerSwipeVelocity, DrawerVelocityTracker } from './velocity';

export const DEFAULT_SWIPE_THRESHOLD = 40;
export const REVERSE_CANCEL_THRESHOLD = 10;
export const MIN_DRAG_THRESHOLD = 1;
/**
 * Distance an axis must travel before the gesture is attributed to it. Mirrors Base UI's
 * `AXIS_LOCK_SLOP`.
 */
export const AXIS_LOCK_SLOP = 6;
/**
 * Extra distance the cross axis must beat the drawer axis by before the gesture is handed to the
 * platform. Mirrors Base UI's `AXIS_LOCK_BIAS`.
 */
export const AXIS_LOCK_BIAS = 2;

export interface DrawerSwipeInput extends DrawerSwipeVector {
  time: number;
  buttons?: number;
  nativeEvent?: Event;
}

export interface DrawerSwipeUpdate {
  rawMovement: DrawerSwipeVector;
  movement: DrawerSwipeVector;
  displacement: number;
  progress: number;
  /**
   * The popup's length along the dismissal axis for this gesture, as measured once at `start()`
   * and refreshed only by `refreshSize()`. Published so a consumer can do release-time maths
   * without measuring the element a second time.
   */
  size: number;
  strength: number;
}

export interface DrawerSwipeRelease extends DrawerSwipeUpdate {
  velocity: DrawerSwipeVelocity;
  dismissed: boolean;
  nativeEvent?: Event;
}

export interface DrawerSwipeEngineOptions {
  direction: () => NgpDrawerSwipeDirection;
  allowOppositeDirection?: () => boolean;
  size: () => number;
  /**
   * Distance the gesture must travel before it dismisses on distance alone. Derived from the size
   * the engine already measured for this gesture, so the popup is measured exactly once at press
   * time. Defaults to `DEFAULT_SWIPE_THRESHOLD`.
   */
  threshold?: (size: number) => number;
  /**
   * Distance the drawer axis must travel before the gesture is attributed to it. Defaults to
   * `AXIS_LOCK_SLOP`. The swipe area passes a smaller value because it opens from a dedicated edge
   * strip where a cross-axis scroll is far less likely than inside the popup.
   */
  axisSlop?: number;
  trackDrag?: boolean;
  onStart?: (input: DrawerSwipeInput) => void;
  onMove?: (update: DrawerSwipeUpdate) => void;
  onRelease?: (release: DrawerSwipeRelease) => void;
  onCancel?: (nativeEvent?: Event) => void;
}

export class DrawerSwipeEngine {
  private startPoint: DrawerSwipeInput | null = null;
  private maximumDisplacement = 0;
  private axisLocked = false;
  private released = false;
  private gestureSize: number | null = null;
  private gestureThreshold: number | null = null;
  private readonly velocity = new DrawerVelocityTracker();

  constructor(private readonly options: DrawerSwipeEngineOptions) {}

  get active(): boolean {
    return this.startPoint !== null;
  }

  start(input: DrawerSwipeInput): boolean {
    if (this.active || (input.buttons !== undefined && input.buttons !== 1)) {
      return false;
    }
    this.startPoint = input;
    this.maximumDisplacement = 0;
    this.axisLocked = false;
    this.released = false;
    this.gestureSize = this.readSize();
    this.gestureThreshold = this.readThreshold(this.gestureSize);
    this.velocity.reset();
    this.velocity.add(input);
    this.options.onStart?.(input);
    return true;
  }

  refreshSize(size?: number): number | null {
    if (!this.active || this.released) {
      return null;
    }
    this.gestureSize = size === undefined ? this.readSize() : Math.max(1, size);
    // The popup was re-measured, so the distance threshold derived from it is stale too. Reuse the
    // freshly-stored size rather than measuring again.
    this.gestureThreshold = this.readThreshold(this.gestureSize);
    return this.gestureSize;
  }

  rebase(input: DrawerSwipeInput, options: { axisLocked?: boolean } = {}): boolean {
    if (!this.active || this.released) {
      return false;
    }
    this.startPoint = input;
    this.maximumDisplacement = 0;
    // The only caller rebases after it has already attributed the gesture to the drawer axis, so
    // the lock is preserved by default; re-earning the slop would swallow the first move after the
    // handoff.
    this.axisLocked = options.axisLocked ?? true;
    this.velocity.reset();
    this.velocity.add(input);
    return true;
  }

  move(input: DrawerSwipeInput): DrawerSwipeUpdate | null {
    const start = this.startPoint;
    if (!start || this.released) {
      return null;
    }
    const raw = { x: input.x - start.x, y: input.y - start.y };
    const directionalDisplacement = getSwipeDisplacement(this.options.direction(), raw);
    const displacement = Math.max(0, directionalDisplacement);
    const primary = this.options.allowOppositeDirection?.()
      ? Math.abs(directionalDisplacement)
      : displacement;
    const cross = Math.abs(getCrossAxisDisplacement(this.options.direction(), raw));
    if (!this.axisLocked) {
      const axisSlop = this.readAxisSlop();
      // Hand the gesture to the platform only once the cross axis has clearly won: it must pass the
      // slop AND beat the drawer axis by the bias. A bare `cross > primary` comparison at one pixel
      // killed gestures that a real finger starts with a pixel of sideways jitter, with no way to
      // recover for the rest of the sequence. Base UI never cancels a single-direction gesture at
      // all; it just withholds progress until the intended axis dominates (useSwipeDismiss.ts).
      if (cross >= AXIS_LOCK_SLOP && cross > primary + AXIS_LOCK_BIAS) {
        this.cancel(input.nativeEvent);
        return null;
      }
      if (primary >= axisSlop) {
        this.axisLocked = true;
      } else {
        // Neither axis is attributed yet. Keep the sample so a single fast move that later crosses
        // the slop still carries its velocity, but emit nothing: callers must not `preventDefault()`
        // or open anything on an unattributed gesture.
        this.velocity.add(input);
        if (input.buttons === 0) {
          this.release(input);
        }
        return null;
      }
    }
    this.maximumDisplacement = Math.max(this.maximumDisplacement, displacement);
    this.velocity.add(input);
    const update = this.createUpdate(raw);
    this.options.onMove?.(update);
    if (input.buttons === 0) {
      this.release(input);
    }
    return update;
  }

  release(input: DrawerSwipeInput): DrawerSwipeRelease | null {
    const start = this.startPoint;
    if (!start || this.released) {
      return null;
    }
    this.released = true;
    const raw = { x: input.x - start.x, y: input.y - start.y };
    const update = this.createUpdate(raw);
    const velocity = this.velocity.read(input);
    const direction = this.options.direction();
    const projectedVelocity = Math.max(
      getSwipeDisplacement(direction, velocity.recent),
      getSwipeDisplacement(direction, velocity.total),
    );
    const reversed = this.maximumDisplacement - update.displacement >= REVERSE_CANCEL_THRESHOLD;
    const threshold =
      this.gestureThreshold ?? this.readThreshold(this.gestureSize ?? this.readSize());
    const dismissed = !reversed && (update.displacement >= threshold || projectedVelocity >= 0.5);
    const result = { ...update, velocity, dismissed, nativeEvent: input.nativeEvent };
    this.options.onRelease?.(result);
    this.reset();
    return result;
  }

  cancel(nativeEvent?: Event): void {
    if (!this.active) {
      return;
    }
    this.options.onCancel?.(nativeEvent);
    this.reset();
  }

  destroy(): void {
    this.cancel();
  }

  private createUpdate(raw: DrawerSwipeVector): DrawerSwipeUpdate {
    const movement =
      this.options.trackDrag === false ? raw : movementForDirection(this.options.direction(), raw);
    const displacement = Math.max(0, getSwipeDisplacement(this.options.direction(), raw));
    const size = this.gestureSize ?? this.readSize();
    return {
      rawMovement: raw,
      movement,
      displacement,
      progress: Math.min(1, displacement / size),
      size,
      // Neutral while dragging. The real value is a release-time duration scalar the viewport
      // writes once, when a swipe actually dismisses the drawer.
      strength: 1,
    };
  }

  private reset(): void {
    this.startPoint = null;
    this.maximumDisplacement = 0;
    this.axisLocked = false;
    this.released = false;
    this.gestureSize = null;
    this.gestureThreshold = null;
    this.velocity.reset();
  }

  private readSize(): number {
    return Math.max(1, this.options.size());
  }

  private readAxisSlop(): number {
    return Math.max(MIN_DRAG_THRESHOLD, this.options.axisSlop ?? AXIS_LOCK_SLOP);
  }

  private readThreshold(size: number): number {
    return Math.max(1, this.options.threshold?.(size) ?? DEFAULT_SWIPE_THRESHOLD);
  }
}
