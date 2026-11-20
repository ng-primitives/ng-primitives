import { Component, computed, signal, ViewEncapsulation } from '@angular/core';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';
import { NgpTooltip, NgpTooltipArrow, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-tooltip-show-on-overflow',
  imports: [NgpTooltipTrigger, NgpTooltip, NgpTooltipArrow, NgpSwitch, NgpSwitchThumb],
  template: `
    <div class="example">
      <label class="control">
        <button
          [ngpSwitchChecked]="truncated()"
          (ngpSwitchCheckedChange)="truncated.set($event)"
          ngpSwitch
        >
          <span ngpSwitchThumb></span>
        </button>
        <span>Long label</span>
      </label>

      <button
        class="label"
        [ngpTooltipTrigger]="tooltip"
        ngpTooltipTriggerShowOnOverflow
        type="button"
      >
        {{ label() }}
      </button>

      <p class="hint">
        {{
          truncated()
            ? 'The label no longer fits, so hovering reveals the full text.'
            : 'The label fits, so no tooltip is shown.'
        }}
      </p>
    </div>

    <ng-template #tooltip>
      <div ngpTooltip>
        {{ label() }}
        <div ngpTooltipArrow></div>
      </div>
    </ng-template>
  `,
  styles: `
    app-tooltip-show-on-overflow {
      .example {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        font-weight: 510;
        letter-spacing: -0.006em;
        color: var(--ngp-text-primary);
      }

      .label {
        /* Fixed, so toggling the label changes its content without resizing it. */
        width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 0.625rem;
        border-radius: 0.5rem;
        height: 2.125rem;
        font-size: 0.875rem;
        font-weight: 510;
        letter-spacing: -0.006em;
        color: var(--ngp-text-primary);
        outline: none;
        background-color: var(--ngp-background);
        box-shadow:
          inset 0 0 0 1px var(--ngp-border),
          0 1px 2px 0 rgb(0 0 0 / 4%);
        transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .label[data-hover] {
        background-color: var(--ngp-background-hover);
      }

      .label[data-focus-visible] {
        outline: 2px solid var(--ngp-focus-ring);
      }

      .label[data-press] {
        background-color: var(--ngp-background-active);
      }

      .hint {
        margin: 0;
        font-size: 0.75rem;
        letter-spacing: -0.011em;
        color: var(--ngp-text-secondary);
      }

      [ngpSwitch] {
        position: relative;
        width: 2.5rem;
        height: 1.5rem;
        border-radius: 9999px;
        background-color: var(--ngp-background-secondary);
        border: 1px solid var(--ngp-border);
        padding: 0;
        outline: none;
        transition:
          background-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
          border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      [ngpSwitch][data-focus-visible] {
        outline: 2px solid var(--ngp-focus-ring);
        outline-offset: 2px;
      }

      [ngpSwitch][data-checked] {
        background-color: var(--ngp-primary);
        border-color: var(--ngp-primary);
      }

      [ngpSwitchThumb] {
        display: block;
        height: 1.25rem;
        width: 1.25rem;
        border-radius: 9999px;
        background-color: white;
        box-shadow: var(--ngp-button-shadow);
        outline: none;
        transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateX(1px);
      }

      [ngpSwitchThumb][data-checked] {
        transform: translateX(17px);
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
      font-weight: 510;
      color: var(--ngp-text-inverse);
      animation: tooltip-show 200ms ease-in-out;
      transform-origin: var(--ngp-tooltip-transform-origin);
    }

    [ngpTooltip][data-exit] {
      animation: tooltip-hide 200ms ease-in-out;
    }

    [ngpTooltipArrow] {
      position: absolute;
      pointer-events: none;
      background-color: var(--ngp-background-inverse);
      width: 8px;
      height: 8px;
      border-radius: 2px;
      transform: rotate(45deg);
    }

    [ngpTooltipArrow][data-placement='top'] {
      top: calc(100% - 5px);
    }

    [ngpTooltipArrow][data-placement='bottom'] {
      bottom: calc(100% - 5px);
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
  encapsulation: ViewEncapsulation.None,
})
export default class TooltipShowOnOverflowExample {
  readonly truncated = signal(true);

  readonly label = computed(() =>
    this.truncated() ? 'Quarterly revenue projection, EMEA region' : 'Revenue',
  );
}
