import { Component } from '@angular/core';
import { injectPopoverContext, NgpPopover } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover',
  hostDirectives: [NgpPopover],
  template: `
    {{ content }}
  `,
  styles: `
    :host {
      position: absolute;
      max-width: 16rem;
      border-radius: 0.5rem;
      background-color: var(--ngp-background-inverse);
      padding: 0.5rem 0.75rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--ngp-text-inverse);
      transform-origin: var(--ngp-popover-transform-origin);
    }

    :host[data-enter] {
      animation: popover-show 200ms ease-in-out;
    }

    :host[data-exit] {
      animation: popover-hide 200ms ease-in-out;
    }

    @keyframes popover-show {
      0% {
        opacity: 0;
        transform: scale(0.5);
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
        transform: scale(0.5);
      }
    }
  `,
})
export class Popover {
  readonly content = injectPopoverContext();
}
