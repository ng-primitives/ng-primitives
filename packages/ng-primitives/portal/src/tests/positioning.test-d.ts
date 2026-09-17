import type { Boundary, Placement, RootBoundary, Strategy } from '@floating-ui/dom';
import { describe, expectTypeOf, it } from 'vitest';
import type {
  NgpBoundary,
  NgpPlacement,
  NgpPositioningStrategy,
  NgpRootBoundary,
} from '../positioning';

/**
 * The `Ngp*` positioning types are written out rather than aliased from Floating UI, so an
 * upgrade that changes one upstream must fail here rather than silently diverge.
 */
describe('positioning types', () => {
  it('matches Floating UI', () => {
    expectTypeOf<NgpPlacement>().toEqualTypeOf<Placement>();
    expectTypeOf<NgpBoundary>().toEqualTypeOf<Boundary>();
    expectTypeOf<NgpRootBoundary>().toEqualTypeOf<RootBoundary>();
    expectTypeOf<NgpPositioningStrategy>().toEqualTypeOf<Strategy>();
  });
});
