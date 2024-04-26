/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RenderResult, render } from '@testing-library/angular';
import { NgpCheckboxDirective } from '../checkbox/checkbox.directive';
import { NgpCheckboxInputDirective } from './checkbox-input.directive';

describe('NgpCheckboxInputDirective', () => {
  let container: RenderResult<unknown, unknown>;

  beforeEach(async () => {
    container = await render(
      `<div ngpCheckbox>
      <input ngpCheckboxInput data-testid="checkbox-input" />
    </div>`,
      {
        imports: [NgpCheckboxDirective, NgpCheckboxInputDirective],
      },
    );
  });

  it('should set the input type', async () => {
    const input = container.getByTestId('checkbox-input');
    expect(input).toBeTruthy();
  });

  it('should set the input tabindex', async () => {
    const input = container.getByTestId('checkbox-input');
    expect(input.tabIndex).toBe(-1);
  });

  it('should set the input aria-hidden', async () => {
    const input = container.getByTestId('checkbox-input');
    expect(input.getAttribute('aria-hidden')).toBe('true');
  });

  it('should set the input checked', async () => {
    const input = container.getByTestId('checkbox-input') as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it('should set the input disabled', async () => {
    const input = container.getByTestId('checkbox-input') as HTMLInputElement;
    expect(input.disabled).toBe(false);
  });

  it('should set the input required', async () => {
    const input = container.getByTestId('checkbox-input') as HTMLInputElement;
    expect(input.required).toBe(false);
  });
});
