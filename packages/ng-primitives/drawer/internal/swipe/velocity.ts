/* Adapted from Base UI useSwipeDismiss at c33f4210 (MIT, Material UI SAS). */
import { DrawerSwipeVector } from './direction';

const MIN_TOTAL_DURATION_MS = 50;
const MIN_RELEASE_DURATION_MS = 16;
const MAX_RELEASE_AGE_MS = 80;

export interface DrawerSwipeSample extends DrawerSwipeVector {
  time: number;
}

export interface DrawerSwipeVelocity {
  total: DrawerSwipeVector;
  recent: DrawerSwipeVector;
}

function velocityBetween(
  first: DrawerSwipeSample,
  last: DrawerSwipeSample,
  minimumDuration: number,
): DrawerSwipeVector {
  const elapsed = Math.max(last.time - first.time, minimumDuration);
  return {
    x: (last.x - first.x) / elapsed,
    y: (last.y - first.y) / elapsed,
  };
}

export class DrawerVelocityTracker {
  private firstSample: DrawerSwipeSample | null = null;
  private lastSample: DrawerSwipeSample | null = null;
  private lastVelocity: DrawerSwipeVector = { x: 0, y: 0 };

  add(sample: DrawerSwipeSample): void {
    const previous = this.lastSample;
    if (previous && sample.time < previous.time) {
      return;
    }
    this.firstSample ??= sample;
    if (previous && sample.time > previous.time) {
      this.lastVelocity = velocityBetween(previous, sample, MIN_RELEASE_DURATION_MS);
    }
    this.lastSample = sample;
  }

  read(release: DrawerSwipeSample): DrawerSwipeVelocity {
    const first = this.firstSample;
    const last = this.lastSample;
    if (!first || !last) {
      return { total: { x: 0, y: 0 }, recent: { x: 0, y: 0 } };
    }

    const total = velocityBetween(first, release, MIN_TOTAL_DURATION_MS);
    let recent = { ...this.lastVelocity };
    if (release.time >= last.time) {
      const age = release.time - last.time;
      if (age > MAX_RELEASE_AGE_MS) {
        recent = { x: 0, y: 0 };
      } else {
        const releaseVelocity = velocityBetween(last, release, MIN_RELEASE_DURATION_MS);
        if (releaseVelocity.x !== 0) {
          recent.x = releaseVelocity.x;
        }
        if (releaseVelocity.y !== 0) {
          recent.y = releaseVelocity.y;
        }
      }
    }
    return { total, recent };
  }

  reset(): void {
    this.firstSample = null;
    this.lastSample = null;
    this.lastVelocity = { x: 0, y: 0 };
  }
}
