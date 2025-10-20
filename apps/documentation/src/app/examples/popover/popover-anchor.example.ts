import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpInput } from 'ng-primitives/input';
import { NgpPopover, NgpPopoverArrow, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover-anchor',
  imports: [NgpPopoverTrigger, NgpPopover, NgpPopoverArrow, NgpButton, NgpInput],
  template: `
    <div class="input-group">
      <input #emailInput ngpInput type="email" placeholder="Enter your email address" />
      <button
        class="help-button"
        [ngpPopoverTrigger]="popover"
        [ngpPopoverTriggerAnchor]="emailInput"
        ngpPopoverTriggerPlacement="bottom"
        ngpButton
        type="button"
        aria-label="Email format help"
      >
        ?
      </button>
    </div>

    <ng-template #popover>
      <div ngpPopover>
        <h3>Email Format</h3>
        <p>Please enter a valid email address in the format: name&#64;domain.com</p>
        <p>
          Examples:
          <br />
          • john.doe&#64;company.com
          <br />
          • user123&#64;example.org
          <br />
          • contact&#64;website.co.uk
        </p>

        <div ngpPopoverArrow></div>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: contents;
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
    }

    [ngpInput] {
      height: 36px;
      flex: 1;
      border-radius: 8px;
      padding: 0 16px;
      border: none;
      box-shadow: var(--ngp-input-shadow);
      outline: none;
    }

    [ngpInput]:focus {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpInput]::placeholder {
      color: var(--ngp-text-placeholder);
    }

    .help-button {
      width: 36px;
      height: 36px;
      padding: 0;
      border-radius: 50%;
      color: var(--ngp-text-primary);
      outline: none;
      font-weight: 500;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .help-button[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    .help-button[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    .help-button[data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpPopover] {
      position: absolute;
      display: flex;
      flex-direction: column;
      row-gap: 4px;
      max-width: 280px;
      border-radius: 0.75rem;
      background: var(--ngp-background);
      padding: 0.75rem 1rem;
      box-shadow: var(--ngp-shadow);
      border: 1px solid var(--ngp-border);
      outline: none;
      animation: popover-show 0.1s ease-out;
      transform-origin: var(--ngp-popover-transform-origin);
    }

    [ngpPopover][data-exit] {
      animation: popover-hide 0.1s ease-out;
    }

    [ngpPopoverArrow] {
      position: absolute;
      pointer-events: none;
    }

    [ngpPopoverArrow][data-placement='top'] {
      bottom: 0;
    }

    [ngpPopoverArrow][data-placement='bottom'] {
      top: 0;
    }

    [ngpPopoverArrow]:before {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      bottom: 100%;
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-bottom-color: var(--ngp-background-inverse);
    }

    [ngpPopoverArrow]:after {
      content: '';
      display: block;
      position: absolute;
      left: 0;
      bottom: 100%;
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-bottom-color: var(--ngp-background);
    }

    [ngpPopover] h3 {
      font-size: 13px;
      font-weight: 500;
      margin: 0;
      color: var(--ngp-text-primary);
    }

    [ngpPopover] p {
      font-size: 13px;
      margin: 0;
      color: var(--ngp-text-secondary);
    }

    @keyframes popover-show {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes popover-hide {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.9);
      }
    }
  `,
})
export default class PopoverAnchorExample {}
