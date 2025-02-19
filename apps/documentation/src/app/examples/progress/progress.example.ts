import { Component, signal } from '@angular/core';
import { NgpProgress, NgpProgressIndicator } from 'ng-primitives/progress';
import { injectDisposables } from 'ng-primitives/utils';

@Component({
  selector: 'app-progress',
  imports: [NgpProgress, NgpProgressIndicator],
  styles: `
    :host {
      display: contents;
    }

    [ngpProgress] {
      position: relative;
      height: 12px;
      width: 100%;
      max-width: 320px;
      overflow: hidden;
      border-radius: 0.5rem;
      border: 1px solid var(--border);
      background-color: var(--background);
    }

    [ngpProgressIndicator] {
      height: 100%;
      border-radius: 0.5rem;
      background-color: var(--background-inverse);
      transition: width 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }
  `,
  template: `
    <div [ngpProgressValue]="value()" ngpProgress>
      <div [style.width.%]="value()" ngpProgressIndicator></div>
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
