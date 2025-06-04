import { NumberInput } from '@angular/cdk/coercion';
import { Component, input, numberAttribute } from '@angular/core';
import {
  NgpProgress,
  NgpProgressIndicator,
  NgpProgressLabel,
  NgpProgressTrack,
  NgpProgressValue,
} from 'ng-primitives/progress';

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
    <span ngpProgressLabel>{{ label() }}</span>
    <span ngpProgressValue>{{ value() }}%</span>

    <div ngpProgressTrack>
      <div ngpProgressIndicator></div>
    </div>
  `,
  styles: `
    :host {
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
})
export class Progress {
  /** The value of the progress. */
  readonly value = input<number, NumberInput>(0, {
    transform: numberAttribute,
  });

  /** The label of the progress. */
  readonly label = input.required<string>();
}
