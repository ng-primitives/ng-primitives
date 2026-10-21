import { Signal } from '@angular/core';
import type { NgpOrientation } from 'ng-primitives/common';
import type {
  NgpFlip,
  NgpOffset,
  NgpOverlayContent,
  NgpOverlayTemplateContext,
  NgpPlacement,
  NgpPosition,
  NgpShift,
} from 'ng-primitives/portal';
import type { TouchedFn } from 'ng-primitives/utils';
import { notNil } from 'ng-primitives/utils';
import { describe, expectTypeOf, it } from 'vitest';

/**
 * These types are part of the public surface used to type templates, positioning options
 * and form callbacks, so a rename or narrowing has to be a deliberate breaking change.
 */
describe('public overlay and utility types', () => {
  it('exposes the template context value as $implicit', () => {
    expectTypeOf<NgpOverlayTemplateContext<Signal<string | undefined>>>().toEqualTypeOf<{
      $implicit: Signal<string | undefined>;
    }>();
  });

  it('accepts a component class as overlay content', () => {
    class Content {}
    expectTypeOf(Content).toExtend<NgpOverlayContent<unknown>>();
  });

  it('describes a position as viewport x and y', () => {
    expectTypeOf<{ x: number; y: number }>().toExtend<NgpPosition>();
  });

  it('accepts boolean, number and option-object forms for flip, shift and offset', () => {
    expectTypeOf<boolean>().toExtend<NgpFlip>();
    expectTypeOf<boolean>().toExtend<NgpShift>();
    expectTypeOf<number>().toExtend<NgpOffset>();
    expectTypeOf<{ mainAxis: number; crossAxis: number }>().toExtend<NgpOffset>();
  });

  it('includes the aligned placements', () => {
    expectTypeOf<'right-start' | 'bottom-start' | 'top-end'>().toExtend<NgpPlacement>();
  });

  it('keeps orientation as horizontal or vertical', () => {
    expectTypeOf<NgpOrientation>().toEqualTypeOf<'horizontal' | 'vertical'>();
  });

  it('types the touched callback as a no-argument function', () => {
    expectTypeOf<TouchedFn>().toEqualTypeOf<() => void>();
  });

  it('narrows away null and undefined when filtering with notNil', () => {
    expectTypeOf([1, null, undefined].filter(notNil)).toEqualTypeOf<number[]>();
  });
});
