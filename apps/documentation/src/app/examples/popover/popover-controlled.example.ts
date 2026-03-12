import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover-controlled',
  imports: [NgpPopoverTrigger, NgpPopover, NgpButton],
  template: `
    <div class="controls">
      <button (click)="open.set(true)" ngpButton type="button">Open</button>
      <button (click)="open.set(false)" ngpButton type="button">Close</button>
    </div>

    <button
      [ngpPopoverTrigger]="popover"
      [ngpPopoverTriggerOpen]="open()"
      (ngpPopoverTriggerOpenChange)="open.set($event)"
      ngpButton
      type="button"
    >
      Controlled Popover
    </button>

    <ng-template #popover>
      <div ngpPopover>
        <h3>Controlled</h3>
        <p>
          This popover's open state is managed externally via the
          <code>open</code>
          input.
        </p>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .controls {
      display: flex;
      gap: 0.5rem;
    }

    button {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
    }

    button[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    button[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    button[data-press] {
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

    code {
      font-size: 12px;
      background: var(--ngp-background-hover);
      padding: 1px 4px;
      border-radius: 4px;
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
export default class PopoverControlledExample {
  readonly open = signal<boolean | undefined>(undefined);
}
