/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { fireEvent, render } from '@testing-library/angular';
import { NgpInput } from './input';

describe('NgpInput', () => {
  it('should add the data-hover attribute on hover', async () => {
    const { getByTestId } = await render(`<input ngpInput data-testid="input" />`, {
      imports: [NgpInput],
    });

    const input = getByTestId('input');
    fireEvent.mouseEnter(input);
    expect(input).toHaveAttribute('data-hover');
    fireEvent.mouseLeave(input);
    expect(input).not.toHaveAttribute('data-hover');
  });

  it('should add the data-pressed attribute on press', async () => {
    const { getByTestId } = await render(`<input ngpInput data-testid="input" />`, {
      imports: [NgpInput],
    });
    const input = getByTestId('input');
    fireEvent.pointerDown(input);
    expect(input).toHaveAttribute('data-press');
    fireEvent.pointerUp(input);
    expect(input).not.toHaveAttribute('data-press');
  });
});
