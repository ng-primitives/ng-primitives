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
    :host {
      --focus-trap-background-color: #f5f5f5;
      --focus-trap-border-color: #e0e0e0;

      --focus-trap-background-color-dark: #18181b;
      --focus-trap-border-color-dark: #3f3f46;

      --focus-trap-button-color: rgb(10 10 10);
      --focus-trap-button-background-color: rgb(255 255 255);
      --focus-trap-button-background-color-hover: rgb(250 250 250);
      --focus-trap-button-pressed-background-color: rgb(245 245 245);

      --focus-trap-button-color-dark: rgb(255 255 255);
      --focus-trap-button-background-color-dark: rgb(43 43 47);
      --focus-trap-button-background-color-hover-dark: rgb(63 63 70);
      --focus-trap-button-pressed-background-color-dark: rgb(39 39 42);
    }

    [ngpFocusTrap] {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      background-color: light-dark(
        var(--focus-trap-background-color),
        var(--focus-trap-background-color-dark)
      );
      border: 1px dashed
        light-dark(var(--focus-trap-border-color), var(--focus-trap-border-color-dark));
      position: relative;
    }

    [ngpFocusTrap]::before {
      position: absolute;
      top: -1.5rem;
      left: 1rem;
      font-size: 0.75rem;
      color: #666;
      content: 'Focus Trap Disabled';
    }

    [ngpFocusTrap][data-focus-trap]::before {
      content: 'Focus Trap Enabled';
    }

    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: light-dark(var(--focus-trap-button-color), var(--focus-trap-button-color-dark));
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: light-dark(
        var(--focus-trap-button-background-color),
        var(--focus-trap-button-background-color-dark)
      );
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    [ngpButton][data-hover] {
      background-color: light-dark(
        var(--focus-trap-button-background-color-hover),
        var(--focus-trap-button-background-color-hover-dark)
      );
    }

    [ngpButton][data-focus-visible] {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px
          light-dark(
            var(--focus-trap-button-background-color),
            var(--focus-trap-button-background-color-dark)
          ),
        0 0 0 4px rgb(59 130 246);
    }

    [ngpButton][data-press] {
      background-color: light-dark(
        var(--focus-trap-button-pressed-background-color),
        var(--focus-trap-button-pressed-background-color-dark)
      );
    }
  `,
})
export default class FocusTrapExample {
  /**
   * Whether the focus trap is disabled.
   */
  disabled = signal(true);
}
