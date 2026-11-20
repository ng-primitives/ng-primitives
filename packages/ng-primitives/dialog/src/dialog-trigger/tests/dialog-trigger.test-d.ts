import type { InputSignal } from '@angular/core';
import { describe, expectTypeOf, it } from 'vitest';
import type { NgpDialogTrigger } from '../dialog-trigger';

/**
 * `undefined` must be bindable so `[ngpDialogTriggerContainer]="el ?? undefined"` falls back to the
 * global container under strict templates, while `null` still means the body.
 */
describe('NgpDialogTrigger container type', () => {
  it('accepts undefined and null', () => {
    expectTypeOf<NgpDialogTrigger['container']>().toEqualTypeOf<
      InputSignal<HTMLElement | string | null | undefined>
    >();
  });
});
