import { Component, inject } from '@angular/core';
import { NgpToastManager } from 'ng-primitives/toast';
import { Toast } from './toast';

@Component({
  selector: 'app-toast-example',
  template: `
    <button class="toast-trigger" (click)="show()" ngpButton>Show Toast</button>
  `,
  styles: `
    .toast-trigger {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
    }

    .toast-trigger[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    .toast-trigger[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .toast-trigger[data-press] {
      background-color: var(--ngp-background-active);
    }
  `,
})
export default class App {
  private readonly toastManager = inject(NgpToastManager);

  show(): void {
    this.toastManager.show(Toast, {
      context: {
        header: 'Toast Title',
        description: 'This is a description of the toast notification.',
      },
    });
  }
}
