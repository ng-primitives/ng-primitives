import { Component, signal, ViewEncapsulation } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-tooltip-dynamic',
  imports: [NgpTooltipTrigger, NgpTooltip, NgpButton],
  template: `
    <div class="scenarios">
      <h3>Scenario 1: Switch template while closed</h3>
      <p>
        Hover the button, move away, click "Switch", hover again — should show the other tooltip.
      </p>
      <div class="row">
        <button [ngpTooltipTrigger]="useSecond() ? tooltipB : tooltipA" ngpButton type="button">
          Hover me
        </button>
        <button (click)="useSecond.set(!useSecond())" ngpButton type="button">
          Switch to {{ useSecond() ? 'A' : 'B' }}
        </button>
        <span class="badge">Active: Tooltip {{ useSecond() ? 'B' : 'A' }}</span>
      </div>

      <h3>Scenario 2: Switch template while open</h3>
      <p>
        Hover the button, then click "Switch" while tooltip is visible — content should update live.
      </p>
      <div class="row">
        <button [ngpTooltipTrigger]="useLiveSecond() ? tooltipD : tooltipC" ngpButton type="button">
          Hover me (keep hovering)
        </button>
        <button (click)="useLiveSecond.set(!useLiveSecond())" ngpButton type="button">
          Switch to {{ useLiveSecond() ? 'C' : 'D' }}
        </button>
        <span class="badge">Active: Tooltip {{ useLiveSecond() ? 'D' : 'C' }}</span>
      </div>

      <h3>Scenario 3: Toggle between template and null</h3>
      <p>
        Hover the button, then click "Disable" — tooltip stays until you leave. Click "Enable" and
        hover again.
      </p>
      <div class="row">
        <button [ngpTooltipTrigger]="showTooltip() ? tooltipE : null" ngpButton type="button">
          Hover me
        </button>
        <button (click)="showTooltip.set(!showTooltip())" ngpButton type="button">
          {{ showTooltip() ? 'Set to null' : 'Set template' }}
        </button>
        <span class="badge">Input: {{ showTooltip() ? 'TemplateRef' : 'null' }}</span>
      </div>
    </div>

    <ng-template #tooltipA>
      <div ngpTooltip>Tooltip A — I am the first tooltip</div>
    </ng-template>

    <ng-template #tooltipB>
      <div ngpTooltip>Tooltip B — I am the second tooltip</div>
    </ng-template>

    <ng-template #tooltipC>
      <div ngpTooltip>Tooltip C — Original content</div>
    </ng-template>

    <ng-template #tooltipD>
      <div ngpTooltip>Tooltip D — Switched content!</div>
    </ng-template>

    <ng-template #tooltipE>
      <div ngpTooltip>I can be toggled on and off</div>
    </ng-template>
  `,
  styles: `
    app-tooltip-dynamic {
      .scenarios {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      h3 {
        margin: 1rem 0 0;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--ngp-text-primary);
      }

      p {
        margin: 0;
        font-size: 0.75rem;
        color: var(--ngp-text-secondary);
      }

      .row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
      }

      .badge {
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        background-color: var(--ngp-background-hover);
        color: var(--ngp-text-secondary);
        font-family: monospace;
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
    }

    [ngpTooltip] {
      position: absolute;
      max-width: 16rem;
      border-radius: 0.5rem;
      background-color: var(--ngp-background-inverse);
      padding: 0.5rem 0.75rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--ngp-text-inverse);
      animation: tooltip-dynamic-show 200ms ease-in-out;
      transform-origin: var(--ngp-tooltip-transform-origin);
    }

    [ngpTooltip][data-exit] {
      animation: tooltip-dynamic-hide 200ms ease-in-out;
    }

    @keyframes tooltip-dynamic-show {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes tooltip-dynamic-hide {
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
  encapsulation: ViewEncapsulation.None,
})
export default class TooltipDynamicExample {
  readonly useSecond = signal(false);
  readonly useLiveSecond = signal(false);
  readonly showTooltip = signal(true);
}
