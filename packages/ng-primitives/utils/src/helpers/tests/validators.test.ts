import { notNil } from 'ng-primitives/utils';
import { describe, expect, it } from 'vitest';

describe('notNil', () => {
  it('rejects only null and undefined, keeping other falsy values', () => {
    const values = [0, '', false, NaN, null, undefined, 'a'];

    expect(values.filter(notNil)).toEqual([0, '', false, NaN, 'a']);
  });
});
