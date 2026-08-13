import { signal } from '@angular/core';
import { describe, expectTypeOf, it } from 'vitest';
import type { NgpOverlayConfig } from '../overlay';
import type { NgpOverlayEntry } from '../overlay-registry';

type ConfigAnchor = NgpOverlayConfig['anchorElement'];
type EntryAnchor = NgpOverlayEntry['anchorElement'];

/**
 * A signal anchor is what lets an open overlay be re-anchored, but `anchorElement` was a
 * plain element first and both `NgpOverlayConfig` and `NgpOverlayEntry` are public. Callers
 * still passing an element must keep compiling, so the widening is asserted rather than
 * left to the one caller that happens to exercise it.
 */
describe('anchorElement types', () => {
  it('accepts a plain element, null and undefined', () => {
    expectTypeOf<HTMLElement>().toExtend<ConfigAnchor>();
    expectTypeOf<null>().toExtend<ConfigAnchor>();
    expectTypeOf<undefined>().toExtend<ConfigAnchor>();

    expectTypeOf<HTMLElement>().toExtend<EntryAnchor>();
    expectTypeOf<null>().toExtend<EntryAnchor>();
  });

  it('accepts a signal of an element', () => {
    expectTypeOf(signal<HTMLElement | null>(null)).toExtend<ConfigAnchor>();
    expectTypeOf(signal<HTMLElement | null>(null)).toExtend<EntryAnchor>();
  });
});
