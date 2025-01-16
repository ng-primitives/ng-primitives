import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-tooltip',
  imports: [NgpTooltipTrigger, NgpTooltip, NgpButton],
  template: `
    <button [ngpTooltipTrigger]="tooltip" ngpButton type="button">Tooltip</button>

    <ng-template #tooltip>
      <div
        class="absolute max-w-64 rounded-lg bg-neutral-950 px-3 py-2 text-xs font-medium text-white"
        ngpTooltip
      >
        Hover over items to reveal additional context or details. Tooltips provide quick insights
        without cluttering your screen.
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      --button-color: rgb(10 10 10);
      --button-background-color: rgb(255 255 255);
      --button-hover-background-color: rgb(250 250 250);
      --button-pressed-background-color: rgb(245 245 245);

      --button-color-dark: rgb(255 255 255);
      --button-background-color-dark: rgb(43 43 47);
      --button-hover-background-color-dark: rgb(63 63 70);
      --button-pressed-background-color-dark: rgb(39 39 42);
    }

    button {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: light-dark(var(--button-color), var(--button-color-dark));
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: light-dark(
        var(--button-background-color),
        var(--button-background-color-dark)
      );
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    button[data-hover] {
      background-color: light-dark(
        var(--button-hover-background-color),
        var(--button-hover-background-color-dark)
      );
    }

    button[data-focus-visible] {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px light-dark(#f5f5f5, #3f3f46),
        0 0 0 4px rgb(59 130 246);
    }

    button[data-press] {
      background-color: light-dark(
        var(--button-pressed-background-color),
        var(--button-pressed-background-color-dark)
      );
    }

    [ngpTooltip] {
      position: absolute;
      max-width: 16rem;
      border-radius: 0.5rem;
      background-color: light-dark(rgb(10 10 10), rgb(99, 99, 99));
      padding: 0.5rem 0.75rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 500;
      color: light-dark(white, white);
    }
  `,
})
export default class TooltipExample {}
