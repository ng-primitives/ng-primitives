import { Component, linkedSignal, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgpButton } from 'ng-primitives/button';
import { NgpTooltip, NgpTooltipArrow, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-button-disabled-tooltip-example',
  imports: [NgpButton, NgpTooltipTrigger, NgpTooltipArrow, NgpTooltip, FormsModule],
  template: `
    <p class="description">
      Use
      <code>focusableWhenDisabled</code>
      to allow users to tab into a disabled button to show a tooltip explaining why an action is
      unavailable.
    </p>

    <div class="form-group">
      <label>
        <input [(ngModel)]="termsAccepted" type="checkbox" />
        I accept the terms and conditions
      </label>
    </div>

    <button
      [aria-label]="isSubmitting() ? 'Submitting, please wait' : null"
      [ngpTooltipTrigger]="tooltipContent"
      [ngpTooltipTriggerDisabled]="!isDisabled()"
      [disabled]="isDisabled()"
      [focusableWhenDisabled]="isDisabled()"
      (click)="submit()"
      ngpButton
    >
      @if (isSubmitting()) {
        <span class="loader" aria-hidden="true"></span>
        Submitting...
      } @else {
        Submit
      }
    </button>

    <ng-template #tooltipContent>
      <div ngpTooltip>
        Please accept the terms to continue
        <div ngpTooltipArrow></div>
      </div>
    </ng-template>

    @if (submitted()) {
      <p class="success">Form submitted successfully!</p>
    }
  `,
  styles: `
    app-button-disabled-tooltip-example {
      display: grid;
      place-items: center;
      gap: 1.5rem;
      text-align: center;

      .description {
        line-height: 1.5;
        text-wrap: balance;
      }

      code {
        background: var(--ngp-background-hover);
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-size: 0.875rem;
      }

      .form-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .form-group label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
      }

      .form-group input[type='checkbox'] {
        width: 1rem;
        height: 1rem;
        cursor: pointer;
      }

      [ngpButton] {
        padding-left: 1rem;
        padding-right: 1rem;
        border-radius: 0.5rem;
        color: var(--ngp-text-primary);
        border: none;
        height: 2.5rem;
        font-weight: 500;
        background-color: var(--ngp-background);
        transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: var(--ngp-button-shadow);
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        gap: 0.5rem;
      }

      [ngpButton][data-hover] {
        background-color: var(--ngp-background-hover);
      }

      [ngpButton][data-focus-visible] {
        outline: 2px solid var(--ngp-focus-ring);
      }

      [ngpButton][data-press] {
        background-color: var(--ngp-background-active);
      }

      [ngpButton][data-disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }

      [ngpButton] .loader {
        width: 1rem;
        height: 1rem;
        border: 2px solid var(--ngp-text-primary);
        border-bottom-color: transparent;
        border-radius: 50%;
        display: inline-block;
        box-sizing: border-box;
        animation: rotation 1s linear infinite;
      }

      .success {
        color: var(--ngp-success, #22c55e);
        font-weight: 500;
      }
    }

    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    [ngpTooltip] {
      position: absolute;
      max-width: 16rem;
      border-radius: 0.5rem;
      background-color: var(--ngp-background-inverse);
      padding: 0.5rem 0.75rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--ngp-text-inverse);
      animation: tooltip-show 200ms ease-in-out;
      transform-origin: var(--ngp-tooltip-transform-origin);
    }

    [ngpTooltip][data-exit] {
      animation: tooltip-hide 200ms ease-in-out;
    }

    [ngpTooltipArrow] {
      position: absolute;
      pointer-events: none;
      background-color: var(--ngp-background-inverse);
      width: 8px;
      height: 8px;
      border-radius: 2px;
      transform: rotate(45deg);
    }

    [ngpTooltipArrow][data-placement='top'] {
      top: calc(100% - 5px);
    }

    [ngpTooltipArrow][data-placement='bottom'] {
      bottom: calc(100% - 5px);
    }

    @keyframes tooltip-show {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes tooltip-hide {
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
  encapsulation: ViewEncapsulation.None,
})
export default class ButtonDisabledTooltipExample {
  readonly termsAccepted = signal(false);
  readonly isSubmitting = signal(false);
  readonly submitted = signal(false);
  readonly isDisabled = linkedSignal(() => !this.termsAccepted() || this.isSubmitting());

  async submit(): Promise<void> {
    this.submitted.set(false);
    this.isSubmitting.set(true);
    await new Promise(res => setTimeout(res, 3000)); // Simulate submitting
    this.isSubmitting.set(false);
    this.submitted.set(true);
  }
}
