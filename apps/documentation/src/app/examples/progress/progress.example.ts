import { Component, signal } from '@angular/core';
import {
  NgpProgress,
  NgpProgressIndicator,
  NgpProgressLabel,
  NgpProgressTrack,
  NgpProgressValue,
} from 'ng-primitives/progress';
import { injectDisposables } from 'ng-primitives/utils';

@Component({
  selector: 'app-progress',
  imports: [
    NgpProgress,
    NgpProgressIndicator,
    NgpProgressTrack,
    NgpProgressLabel,
    NgpProgressValue,
  ],
  styles: `
    [ngpProgress] {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-row-gap: 0.5rem;
      width: 200px;
      box-sizing: border-box;
      padding: 0.5rem;
    }

    [ngpProgressLabel] {
      color: var(--ngp-text-emphasis);
      font-size: 14px;
      font-weight: 600;
    }

    [ngpProgressValue] {
      color: var(--ngp-text-secondary);
      font-size: 14px;
      font-weight: 500;
      text-align: right;
      grid-column-start: 2;
      text-align: end;
    }

    [ngpProgressTrack] {
      grid-column: 1 / 3;
      position: relative;
      height: 12px;
      width: 100%;
      max-width: 320px;
      overflow: hidden;
      border-radius: 0.5rem;
      border: 1px solid var(--ngp-border);
      background-color: var(--ngp-background);
    }

    [ngpProgressIndicator] {
      height: 100%;
      border-radius: 0.5rem;
      background-color: var(--ngp-background-inverse);
      transition: width 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }
  `,
  template: `
    <div [ngpProgressValue]="value()" ngpProgress>
      <span ngpProgressLabel>Loading</span>
      <span ngpProgressValue>{{ value() }}%</span>

      <div ngpProgressTrack>
        <div ngpProgressIndicator></div>
      </div>
    </div>
  `,
})
export default class ProgressExample {
  /**
   * The value of the progress bar.
   */
  readonly value = signal(0);

  /**
   * Use the disposable helpers to ensure the interval is cleared when the component is destroyed.
   */
  readonly disposables = injectDisposables();

  constructor() {
    this.disposables.setInterval(
      () => this.value.update(value => (value > 100 ? 0 : value + 1)),
      50,
    );
  }
}
