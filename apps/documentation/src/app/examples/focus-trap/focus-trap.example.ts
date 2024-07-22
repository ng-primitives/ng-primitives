import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';

@Component({
  standalone: true,
  selector: 'app-focus-trap',
  imports: [NgpFocusTrap, NgpButton],
  template: `
    <div [ngpFocusTrapDisabled]="disabled()" ngpFocusTrap>
      <button (click)="disabled.set(false)" ngpButton>Enable Focus Trap</button>
      <button (click)="disabled.set(true)" ngpButton>Disable Focus Trap</button>
    </div>
  `,
  styles: `
    [ngpFocusTrap] {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      background-color: #f5f5f5;
      border: 1px dashed #e0e0e0;
      position: relative;
    }

    [ngpFocusTrap]::before {
      position: absolute;
      top: -1.5rem;
      left: 1rem;
      font-size: 0.75rem;
      color: #666;
    }

    [ngpFocusTrap][data-focus-trap='true']::before {
      content: 'Focus Trap Enabled';
    }

    [ngpFocusTrap][data-focus-trap='false']::before {
      content: 'Focus Trap Disabled';
    }

    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: rgb(10 10 10);
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: #fff;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    [ngpButton][data-hover='true'] {
      background-color: rgb(250 250 250);
    }

    [ngpButton][data-focus-visible='true'] {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px #f5f5f5,
        0 0 0 4px rgb(59 130 246);
    }

    [ngpButton][data-press='true'] {
      background-color: rgb(245 245 245);
    }
  `,
})
export default class FocusTrapExample {
  /**
   * Whether the focus trap is disabled.
   */
  disabled = signal(true);
}
