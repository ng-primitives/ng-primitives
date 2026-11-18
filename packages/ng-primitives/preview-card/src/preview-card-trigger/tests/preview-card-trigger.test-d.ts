import type { InputSignal } from '@angular/core';
import { describe, expectTypeOf, it } from 'vitest';
import type { NgpPreviewCardTrigger } from '../preview-card-trigger';

describe('NgpPreviewCardTrigger anchor type', () => {
  it('accepts any element, including an svg one', () => {
    expectTypeOf<NgpPreviewCardTrigger['anchor']>().toEqualTypeOf<InputSignal<Element | null>>();
  });
});
