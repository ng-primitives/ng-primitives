import type { InputSignal } from '@angular/core';
import { describe, expectTypeOf, it } from 'vitest';
import type { NgpMenuTrigger } from '../menu-trigger';

describe('NgpMenuTrigger anchor type', () => {
  it('accepts any element, including an svg one', () => {
    expectTypeOf<NgpMenuTrigger['anchor']>().toEqualTypeOf<InputSignal<Element | null>>();
    expectTypeOf<SVGCircleElement>().toExtend<Parameters<NgpMenuTrigger['setAnchor']>[0]>();
  });
});
