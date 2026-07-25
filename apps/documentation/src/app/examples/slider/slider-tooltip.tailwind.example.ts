import { Component, viewChild } from '@angular/core';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-slider-tooltip',
  imports: [
    NgpSlider,
    NgpSliderRange,
    NgpSliderThumb,
    NgpSliderTrack,
    NgpTooltipTrigger,
    NgpTooltip,
  ],
  host: {
    class: 'block',
  },
  template: `
    <div
      class="relative flex h-5 w-[200px] touch-none items-center select-none"
      [(ngpSliderValue)]="value"
      ngpSlider
    >
      <div
        class="relative h-[5px] w-full rounded-full bg-gray-300 before:absolute before:top-1/2 before:right-0 before:left-0 before:h-5 before:-translate-y-1/2 before:content-[''] dark:bg-gray-700"
        ngpSliderTrack
      >
        <div
          class="absolute h-full rounded-full bg-[#f01e2b] dark:bg-[#ff4651]"
          ngpSliderRange
        ></div>
      </div>
      <div
        class="absolute block h-5 w-5 -translate-x-1/2 rounded-full bg-white shadow-xs ring-1 ring-black/5 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-0 data-focus-visible:outline-blue-500 dark:bg-white dark:ring-white/10 dark:data-focus-visible:outline-blue-400"
        #tooltipTrigger="ngpTooltipTrigger"
        [ngpTooltipTrigger]="tooltip"
        (pointerenter)="onThumbPointerEnter()"
        (pointerleave)="onThumbPointerLeave()"
        (focus)="onThumbFocus()"
        (blur)="onThumbBlur()"
        (ngpSliderThumbDragStart)="onThumbDragStart()"
        (ngpSliderThumbDragEnd)="onThumbDragEnd()"
        ngpTooltipTriggerPlacement="top"
        ngpTooltipTriggerHideDelay="0"
        ngpTooltipTriggerTrackPosition="true"
        ngpTooltipTriggerDisabled="true"
        ngpSliderThumb
      ></div>
    </div>

    <ng-template #tooltip>
      <div
        class="absolute rounded border-none bg-black px-2 py-1 text-xs font-[500] whitespace-nowrap text-white dark:bg-white dark:text-black"
        ngpTooltip
      >
        {{ value }}
      </div>
    </ng-template>
  `,
})
export default class SliderTooltipExample {
  readonly tooltipTrigger = viewChild.required<NgpTooltipTrigger>('tooltipTrigger');

  value = 50;
  private isDragging = false;
  private isHovered = false;
  private isFocused = false;

  onThumbPointerEnter(): void {
    this.isHovered = true;
    this.tooltipTrigger().show();
  }

  onThumbPointerLeave(): void {
    this.isHovered = false;
    if (!this.isDragging && !this.isFocused) {
      this.tooltipTrigger().hide();
    }
  }

  onThumbFocus(): void {
    this.isFocused = true;
    this.tooltipTrigger().show();
  }

  onThumbBlur(): void {
    this.isFocused = false;
    if (!this.isDragging && !this.isHovered) {
      this.tooltipTrigger().hide();
    }
  }

  onThumbDragStart(): void {
    this.isDragging = true;
    this.tooltipTrigger().show();
  }

  onThumbDragEnd(): void {
    this.isDragging = false;
    if (!this.isHovered && !this.isFocused) {
      this.tooltipTrigger().hide();
    }
  }
}
