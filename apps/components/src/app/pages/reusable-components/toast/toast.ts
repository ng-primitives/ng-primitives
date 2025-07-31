import { Component, input, viewChild } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpToast } from 'ng-primitives/toast';

@Component({
  selector: 'app-toast',
  imports: [NgpButton, NgpToast],
  template: `
    <ng-template #toast="ngpToast" ngpToast let-dismiss="dismiss">
      <div class="toast">
        <p class="toast-title">{{ header() }}</p>
        <p class="toast-description">{{ description() }}</p>
        <button class="toast-dismiss" (click)="dismiss()" ngpButton>Dismiss</button>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: none;
    }

    .toast {
      position: fixed;
      display: inline-grid;
      background: var(--ngp-background);
      box-shadow: var(--ngp-shadow);
      border: 1px solid var(--ngp-border);
      max-width: 90vw;
      width: 100%;
      box-sizing: border-box;
      margin-inline: auto;
      padding: 12px 16px;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
      border-radius: 8px;
      z-index: 9999;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      column-gap: 12px;
      align-items: center;
    }

    .toast-title {
      color: var(--ngp-text-primary);
      font-size: 0.75rem;
      font-weight: 600;
      margin: 0;
      grid-column: 1 / 2;
      grid-row: 1;
      line-height: 16px;
    }

    .toast-description {
      font-size: 0.75rem;
      margin: 0;
      color: var(--ngp-text-secondary);
      grid-column: 1 / 2;
      grid-row: 2;
      line-height: 16px;
    }

    .toast-dismiss {
      background: var(--ngp-background-inverse);
      color: var(--ngp-text-inverse);
      border: none;
      border-radius: 8px;
      padding: 4px 8px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
      grid-column: 2 / 3;
      grid-row: 1 / 3;
      max-height: 27px;
    }

    .toast[data-toast='visible'] {
      opacity: 1;
    }

    .toast[data-position='end'] {
      right: 16px;
    }

    .toast[data-position='start'] {
      left: 16px;
    }

    .toast[data-gravity='top'] {
      top: -150px;
    }

    .toast[data-gravity='bottom'] {
      bottom: -150px;
    }

    .toast[data-position='center'] {
      margin-left: auto;
      margin-right: auto;
      left: 0;
      right: 0;
      max-width: fit-content;
    }
  `,
})
export class Toast {
  readonly header = input.required<string>();
  readonly description = input.required<string>();
  protected readonly template = viewChild.required(NgpToast);

  show(): void {
    this.template().show();
  }
}
