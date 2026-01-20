import { Component, signal, viewChild } from '@angular/core';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-tooltip-cursor',
  imports: [NgpTooltipTrigger, NgpTooltip],
  template: `
    <div
      class="hover-region"
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
      <div class="ngp-tooltip-content" ngpTooltip>Position: {{ mouseX() }}, {{ mouseY() }}</div>
    </ng-template>
  `,
  styles: `
    .hover-region {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      padding: 1rem;
      border: 2px dashed var(--ngp-border);
      border-radius: 8px;
      color: var(--ngp-text-secondary);
      user-select: none;
    }

    ::ng-deep .ngp-tooltip-content {
      position: absolute;
      max-width: 16rem;
      border-radius: 0.5rem;
      background-color: var(--ngp-background-inverse);
      padding: 0.5rem 0.75rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--ngp-text-inverse);
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
