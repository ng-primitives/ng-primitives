import { Component, signal, viewChild } from '@angular/core';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-tooltip-cursor',
  imports: [NgpTooltipTrigger, NgpTooltip],
  template: `
    <div
      class="flex h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-black/10 p-4 text-gray-600 select-none dark:border-zinc-800 dark:text-gray-300"
      #tooltipTrigger="ngpTooltipTrigger"
      [ngpTooltipTrigger]="cursorTooltip"
      [ngpTooltipTriggerPosition]="cursorPosition()"
      (pointerenter)="onPointerEnter()"
      (pointermove)="onPointerMove($event)"
      (pointerleave)="onPointerLeave()"
      ngpTooltipTriggerTrackPosition="true"
      ngpTooltipTriggerDisabled="true"
      ngpTooltipTriggerPlacement="top"
      ngpTooltipTriggerOffset="12"
      ngpTooltipTriggerShowDelay="0"
      ngpTooltipTriggerHideDelay="0"
    >
      Hover anywhere in this region
    </div>

    <ng-template #cursorTooltip>
      <div
        class="ngp-tooltip-content absolute max-w-64 rounded-lg border-none bg-black px-3 py-2 text-xs font-[510] text-white dark:bg-white dark:text-black"
        ngpTooltip
      >
        Position: {{ mouseX() }}, {{ mouseY() }}
      </div>
    </ng-template>
  `,
  styles: `
    ::ng-deep .ngp-tooltip-content {
      animation: tooltip-cursor-show 200ms ease-in-out;
      transform-origin: var(--ngp-tooltip-transform-origin);
    }

    ::ng-deep .ngp-tooltip-content[data-exit] {
      animation: tooltip-cursor-hide 200ms ease-in-out;
    }

    @keyframes tooltip-cursor-show {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes tooltip-cursor-hide {
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
export default class TooltipCursorExample {
  readonly mouseX = signal(0);
  readonly mouseY = signal(0);
  readonly cursorPosition = signal<{ x: number; y: number } | null>(null);
  readonly tooltipTrigger = viewChild.required<NgpTooltipTrigger>('tooltipTrigger');

  onPointerEnter(): void {
    this.tooltipTrigger().show();
  }

  onPointerMove(event: PointerEvent): void {
    this.mouseX.set(Math.round(event.clientX));
    this.mouseY.set(Math.round(event.clientY));
    this.cursorPosition.set({ x: event.clientX, y: event.clientY });
  }

  onPointerLeave(): void {
    this.tooltipTrigger().hide();
  }
}
