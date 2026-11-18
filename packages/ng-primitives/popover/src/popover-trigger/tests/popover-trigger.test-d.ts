import type { InputSignal } from '@angular/core';
import { describe, expectTypeOf, it } from 'vitest';
import type { NgpPopoverTrigger } from '../popover-trigger';

describe('NgpPopoverTrigger anchor type', () => {
  it('accepts any element, including an svg one', () => {
    expectTypeOf<NgpPopoverTrigger['anchor']>().toEqualTypeOf<InputSignal<Element | null>>();
    expectTypeOf<SVGCircleElement>().toExtend<Parameters<NgpPopoverTrigger['setAnchor']>[0]>();
  });
});
