import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';

@Component({
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
      background-color: var(--background-active);
      border: 1px dashed var(--border);
      position: relative;
    }

    [ngpFocusTrap]::before {
      position: absolute;
      top: -1.5rem;
      left: 1rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
      content: 'Focus Trap Disabled';
    }

    [ngpFocusTrap][data-focus-trap]::before {
      content: 'Focus Trap Enabled';
    }

    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--text-primary);
      border: 1px solid var(--border);
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow);
    }

    [ngpButton][data-hover] {
      background-color: var(--background-hover);
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    [ngpButton][data-press] {
      background-color: var(--background-active);
    }
  `,
})
export default class FocusTrapExample {
  /**
   * Whether the focus trap is disabled.
   */
  disabled = signal(true);
}
