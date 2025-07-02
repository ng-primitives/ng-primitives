import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpPopover, NgpPopoverArrow, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover',
  imports: [NgpPopoverTrigger, NgpPopover, NgpPopoverArrow, NgpButton],
  template: `
    <button [ngpPopoverTrigger]="popover" ngpButton type="button">Popover</button>

    <ng-template #popover>
      <div ngpPopover>
        <h3>Need Help?</h3>
        <p>
          Get quick tips and guidance on how to use this feature effectively. Check out our
          documentation for more details!
        </p>

        <a target="_blank" href="https://www.youtube.com/watch?v=xvFZjo5PgG0">Learn More</a>

        <div ngpPopoverArrow></div>
      </div>
    </ng-template>
  `,
  styles: `
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

    [ngpPopoverArrow] {
      position: absolute;
      pointer-events: none;
      top: 0px;
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

    [ngpPopover] a {
      font-size: 13px;
      color: var(--ngp-text-blue);
      text-decoration: none;
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
export default class PopoverExample {}
