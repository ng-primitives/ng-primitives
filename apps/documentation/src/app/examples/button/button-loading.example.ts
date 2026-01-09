import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button-loading-example',
  imports: [NgpButton],
  template: `
    <button
      [disabled]="loading()"
      [focusableWhenDisabled]="loading()"
      [aria-label]="loading() ? 'Submitting, please wait' : null"
      (click)="startLoading()"
      ngpButton
    >
      @if (loading()) {
        <span class="loader" aria-hidden="true"></span>
        Submitting...
      } @else {
        Submit
      }
    </button>
  `,
  styles: `
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
      cursor: default;
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
    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `,
})
export default class ButtonLoadingExample {
  readonly loading = signal(false);
  startLoading() {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 3000);
  }
}
