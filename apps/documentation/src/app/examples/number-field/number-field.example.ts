import { Component, signal } from '@angular/core';
import {
  NgpNumberField,
  NgpNumberFieldDecrement,
  NgpNumberFieldIncrement,
  NgpNumberFieldInput,
} from 'ng-primitives/number-field';

@Component({
  selector: 'app-number-field',
  imports: [NgpNumberField, NgpNumberFieldInput, NgpNumberFieldIncrement, NgpNumberFieldDecrement],
  styles: `
    :host {
      display: contents;
    }

    [ngpNumberField] {
      display: inline-flex;
      align-items: center;
      border-radius: 8px;
      box-shadow: var(--ngp-input-shadow);
      background-color: var(--ngp-background);
      overflow: hidden;
    }

    [ngpNumberField]:focus-within {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpNumberFieldInput] {
      width: 64px;
      height: 36px;
      border: none;
      outline: none;
      text-align: center;
      font-size: 0.875rem;
      color: var(--ngp-text-primary);
      background: transparent;
      box-sizing: border-box;
      padding: 0;
    }

    [ngpNumberFieldInput]::placeholder {
      color: var(--ngp-text-placeholder);
    }

    [ngpNumberFieldIncrement],
    [ngpNumberFieldDecrement] {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: transparent;
      color: var(--ngp-text-secondary);
      cursor: pointer;
      font-size: 1rem;
      user-select: none;
      -webkit-touch-callout: none;
      transition:
        color 150ms ease,
        background-color 150ms ease;
    }

    [ngpNumberFieldIncrement][data-hover],
    [ngpNumberFieldDecrement][data-hover] {
      background-color: var(--ngp-background-hover);
      color: var(--ngp-text-primary);
    }

    [ngpNumberFieldIncrement][data-press],
    [ngpNumberFieldDecrement][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpNumberFieldIncrement][data-disabled],
    [ngpNumberFieldDecrement][data-disabled] {
      opacity: 0.4;
      cursor: not-allowed;
    }

    [ngpNumberFieldIncrement][data-disabled][data-hover],
    [ngpNumberFieldDecrement][data-disabled][data-hover] {
      background: transparent;
      color: var(--ngp-text-secondary);
    }
  `,
  template: `
    <div
      [(ngpNumberFieldValue)]="value"
      [ngpNumberFieldMin]="0"
      [ngpNumberFieldMax]="100"
      ngpNumberField
    >
      <button ngpNumberFieldDecrement aria-label="Decrement">−</button>
      <input ngpNumberFieldInput />
      <button ngpNumberFieldIncrement aria-label="Increment">+</button>
    </div>
  `,
})
export default class NumberFieldExample {
  value = signal(0);
}
