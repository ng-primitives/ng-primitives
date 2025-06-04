import { Component } from '@angular/core';
import { Toast } from './toast';

@Component({
  selector: 'app-toast-example',
  imports: [Toast],
  template: `
    <button class="toast-trigger" (click)="toast.show()" ngpButton>Show Toast</button>

    <app-toast
      #toast
      header="This is a toast message"
      description="It will disappear in 3 seconds"
    />
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
export default class App {}
