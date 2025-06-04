import { Component } from '@angular/core';
import { injectTooltipContext, NgpTooltip } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-tooltip',
  hostDirectives: [NgpTooltip],
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
      transform-origin: var(--ngp-tooltip-transform-origin);
    }

    :host[data-enter] {
      animation: tooltip-show 200ms ease-in-out;
    }

    :host[data-exit] {
      animation: tooltip-hide 200ms ease-in-out;
    }

    @keyframes tooltip-show {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes tooltip-hide {
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
export class Tooltip {
  /** Access the tooltip context where the content is stored. */
  protected readonly content = injectTooltipContext<string>();
}
