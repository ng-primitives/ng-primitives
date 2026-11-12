import type { InputSignal } from '@angular/core';
import { describe, expectTypeOf, it } from 'vitest';
import type { NgpTooltipTrigger } from '../tooltip-trigger';

describe('NgpTooltipTrigger anchor type', () => {
  it('accepts any element, including an svg one', () => {
    expectTypeOf<NgpTooltipTrigger['anchor']>().toEqualTypeOf<InputSignal<Element | null>>();
    expectTypeOf<SVGCircleElement>().toExtend<Parameters<NgpTooltipTrigger['setAnchor']>[0]>();
  });
});
