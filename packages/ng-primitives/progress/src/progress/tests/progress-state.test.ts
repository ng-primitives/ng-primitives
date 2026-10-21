import { Component, effect, input } from '@angular/core';
import { render } from '@testing-library/angular';
import {
  injectProgressState,
  NgpProgress,
  NgpProgressIndicator,
  NgpProgressTrack,
} from 'ng-primitives/progress';
import { describe, expect, it } from 'vitest';

/** Drives the progress value through the injected state instead of the value input. */
@Component({
  selector: 'app-progress',
  hostDirectives: [NgpProgress],
  imports: [NgpProgressTrack, NgpProgressIndicator],
  template: `
    <div ngpProgressTrack>
      <div ngpProgressIndicator data-testid="indicator"></div>
    </div>
    <span data-testid="value">{{ state().value() }}</span>
  `,
})
class StateDrivenProgress {
  readonly percentage = input(0);
  protected readonly state = injectProgressState();

  constructor() {
    effect(() => this.state().setValue(this.percentage()));
  }
}

describe('NgpProgress state', () => {
  it('should update aria values, indicator width and the state value when setValue is called', async () => {
    const { getByRole, getByTestId, fixture, rerender } = await render(
      `<app-progress [percentage]="percentage" />`,
      { imports: [StateDrivenProgress], componentProperties: { percentage: 25 } },
    );
    const progress = getByRole('progressbar');

    expect(progress).toHaveAttribute('aria-valuenow', '25');
    expect(getByTestId('indicator').style.width).toBe('25%');
    expect(getByTestId('value')).toHaveTextContent('25');

    await rerender({ componentProperties: { percentage: 62.5 } });
    await fixture.whenStable();

    expect(progress).toHaveAttribute('aria-valuenow', '62.5');
    expect(getByTestId('indicator').style.width).toBe('62.5%');
    expect(getByTestId('value')).toHaveTextContent('62.5');
  });
});
