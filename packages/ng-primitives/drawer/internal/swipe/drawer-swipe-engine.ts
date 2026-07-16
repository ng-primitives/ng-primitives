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
  threshold?: number;
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
    return this.gestureSize;
  }

  rebase(input: DrawerSwipeInput): boolean {
    if (!this.active || this.released) {
      return false;
    }
    this.startPoint = input;
    this.maximumDisplacement = 0;
    this.axisLocked = false;
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
    if (!this.axisLocked && Math.max(primary, cross) >= MIN_DRAG_THRESHOLD) {
      if (cross > primary) {
        this.cancel(input.nativeEvent);
        return null;
      }
      this.axisLocked = true;
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
    const dismissed =
      !reversed &&
      (update.displacement >= (this.options.threshold ?? DEFAULT_SWIPE_THRESHOLD) ||
        projectedVelocity >= 0.5);
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
      strength: Math.min(
        1,
        displacement / Math.max(1, this.options.threshold ?? DEFAULT_SWIPE_THRESHOLD),
      ),
    };
  }

  private reset(): void {
    this.startPoint = null;
    this.maximumDisplacement = 0;
    this.axisLocked = false;
    this.released = false;
    this.gestureSize = null;
    this.velocity.reset();
  }

  private readSize(): number {
    return Math.max(1, this.options.size());
  }
}
