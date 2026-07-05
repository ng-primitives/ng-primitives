import { NumberInput } from '@angular/cdk/coercion';
import { Component, input, numberAttribute } from '@angular/core';
import { render } from '@testing-library/angular';
import {
  NgpProgress,
  NgpProgressIndicator,
  NgpProgressLabel,
  NgpProgressTrack,
  NgpProgressValue,
} from 'ng-primitives/progress';
import { describe, expect, it } from 'vitest';

/**
 * Inline fixture mirroring the reusable component at
 * `apps/components/src/app/pages/reusable-components/progress/progress.ts`.
 */
@Component({
  selector: 'app-progress',
  hostDirectives: [
    {
      directive: NgpProgress,
      inputs: ['ngpProgressValue:value', 'ngpProgressMax:max', 'ngpProgressValueLabel:valueLabel'],
    },
  ],
  imports: [NgpProgressIndicator, NgpProgressTrack, NgpProgressLabel, NgpProgressValue],
  template: `
    <label ngpProgressLabel>{{ label() }}</label>
    <span ngpProgressValue>{{ value() }}%</span>

    <div ngpProgressTrack>
      <div ngpProgressIndicator></div>
    </div>
  `,
})
class ProgressFixture {
  readonly value = input<number, NumberInput>(0, { transform: numberAttribute });
  readonly label = input.required<string>();
}

describe('Progress (reusable component) — standalone', () => {
  const imports = [ProgressFixture];

  it('renders the label and value text', async () => {
    const { getByText } = await render(`<app-progress label="Loading" value="40"></app-progress>`, {
      imports,
    });
    expect(getByText('Loading')).toBeVisible();
    expect(getByText('40%')).toBeVisible();
  });

  it('applies the progressbar role and ARIA attributes', async () => {
    const { getByRole } = await render(`<app-progress label="Loading" value="40"></app-progress>`, {
      imports,
    });
    const progress = getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '40');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
    expect(progress).toHaveAttribute('aria-valuetext', '40%');
  });

  it('associates the label via aria-labelledby', async () => {
    const { getByRole, getByText } = await render(
      `<app-progress label="Loading" value="40"></app-progress>`,
      { imports },
    );
    const label = getByText('Loading');
    expect(getByRole('progressbar')).toHaveAttribute('aria-labelledby', label.id);
  });

  it('sets the indicator width based on value', async () => {
    const { container } = await render(`<app-progress label="Loading" value="40"></app-progress>`, {
      imports,
    });
    const indicator = container.querySelector('[ngpProgressIndicator]') as HTMLElement;
    expect(indicator.style.width).toBe('40%');
  });

  it('updates the indicator width when value changes', async () => {
    const { container, rerender, detectChanges } = await render(
      `<app-progress label="Loading" [value]="value"></app-progress>`,
      { imports, componentProperties: { value: 40 } },
    );
    const indicator = container.querySelector('[ngpProgressIndicator]') as HTMLElement;
    expect(indicator.style.width).toBe('40%');

    await rerender({ componentProperties: { value: 75 } });
    detectChanges();
    expect(indicator.style.width).toBe('75%');
  });

  it('marks the value element as aria-hidden', async () => {
    const { container } = await render(`<app-progress label="Loading" value="40"></app-progress>`, {
      imports,
    });
    const value = container.querySelector('[ngpProgressValue]') as HTMLElement;
    expect(value).toHaveAttribute('aria-hidden', 'true');
  });
});
