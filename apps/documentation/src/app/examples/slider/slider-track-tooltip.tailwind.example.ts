import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { NgpSlider, NgpSliderRange, NgpSliderThumb, NgpSliderTrack } from 'ng-primitives/slider';
import { NgpTooltip, NgpTooltipTrigger } from 'ng-primitives/tooltip';

@Component({
  selector: 'app-slider-track-tooltip',
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
        class="relative h-[5px] w-full rounded-full bg-zinc-300 before:absolute before:top-1/2 before:right-0 before:left-0 before:h-5 before:-translate-y-1/2 before:content-[''] dark:bg-zinc-700"
        #track
        #trackTooltipTrigger="ngpTooltipTrigger"
        [ngpTooltipTrigger]="trackTooltip"
        [ngpTooltipTriggerPosition]="trackTooltipPosition()"
        (pointerenter)="onTrackPointerEnter($event)"
        (pointermove)="onTrackPointerMove($event)"
        (pointerleave)="onTrackPointerLeave()"
        ngpTooltipTriggerTrackPosition="true"
        ngpTooltipTriggerDisabled="true"
        ngpTooltipTriggerPlacement="top"
        ngpTooltipTriggerOffset="14"
        ngpTooltipTriggerShowDelay="0"
        ngpTooltipTriggerHideDelay="0"
        ngpSliderTrack
      >
        <div
          class="absolute h-full rounded-full bg-[#f01e2b] dark:bg-[#ff4651]"
          ngpSliderRange
        ></div>
      </div>
      <div
        class="absolute block h-5 w-5 -translate-x-1/2 rounded-full bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.1),0_1px_2px_-1px_rgb(0_0_0/0.1),0_0_0_1px_rgb(0_0_0/0.05)] outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-0 data-focus-visible:outline-blue-500 dark:bg-white dark:shadow-[0_1px_3px_0_rgb(255_255_255/0.1),0_1px_2px_-1px_rgb(255_255_255/0.1),0_0_0_1px_rgb(255_255_255/0.05)] dark:data-focus-visible:outline-blue-400"
        #thumbTooltipTrigger="ngpTooltipTrigger"
        [ngpTooltipTrigger]="thumbTooltip"
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

    <ng-template #trackTooltip>
      <div
        class="absolute rounded border-none bg-black px-2 py-1 text-xs font-[500] whitespace-nowrap text-white dark:bg-white dark:text-black"
        ngpTooltip
      >
        {{ previewValue() }}
      </div>
    </ng-template>

    <ng-template #thumbTooltip>
      <div
        class="absolute rounded border-none bg-black px-2 py-1 text-xs font-[500] whitespace-nowrap text-white dark:bg-white dark:text-black"
        ngpTooltip
      >
        {{ value }}
      </div>
    </ng-template>
  `,
})
export default class SliderTrackTooltipExample {
  readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  readonly trackTooltipTrigger = viewChild.required<NgpTooltipTrigger>('trackTooltipTrigger');
  readonly thumbTooltipTrigger = viewChild.required<NgpTooltipTrigger>('thumbTooltipTrigger');

  readonly trackTooltipPosition = signal<{ x: number; y: number } | null>(null);
  readonly previewValue = signal(0);

  value = 50;
  private readonly min = 0;
  private readonly max = 100;
  private isDragging = false;
  private isThumbHovered = false;
  private isThumbFocused = false;

  onTrackPointerEnter(event: PointerEvent): void {
    if (!this.isThumbActive()) {
      this.updateTrackTooltip(event);
      this.trackTooltipTrigger().show();
    }
  }

  onTrackPointerMove(event: PointerEvent): void {
    if (this.isThumbActive()) {
      return;
    }
    this.updateTrackTooltip(event);
  }

  private updateTrackTooltip(event: PointerEvent): void {
    const trackElement = this.track().nativeElement;
    const rect = trackElement.getBoundingClientRect();

    // Calculate percentage position along the track
    const percentage = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));

    // Calculate the preview value
    const previewValue = Math.round(this.min + percentage * (this.max - this.min));
    this.previewValue.set(previewValue);

    // Update tooltip position - X follows cursor, Y fixed at track center
    const trackCenterY = rect.top + rect.height / 2;
    this.trackTooltipPosition.set({ x: event.clientX, y: trackCenterY });
  }

  onTrackPointerLeave(): void {
    if (!this.isThumbActive()) {
      this.trackTooltipTrigger().hide();
    }
  }

  onThumbPointerEnter(): void {
    this.isThumbHovered = true;
    this.trackTooltipTrigger().hide();
    this.thumbTooltipTrigger().show();
  }

  onThumbPointerLeave(): void {
    this.isThumbHovered = false;
    if (!this.isDragging && !this.isThumbFocused) {
      this.thumbTooltipTrigger().hide();
    }
  }

  onThumbFocus(): void {
    this.isThumbFocused = true;
    this.trackTooltipTrigger().hide();
    this.thumbTooltipTrigger().show();
  }

  onThumbBlur(): void {
    this.isThumbFocused = false;
    if (!this.isDragging && !this.isThumbHovered) {
      this.thumbTooltipTrigger().hide();
    }
  }

  onThumbDragStart(): void {
    this.isDragging = true;
    this.trackTooltipTrigger().hide();
    this.thumbTooltipTrigger().show();
  }

  onThumbDragEnd(): void {
    this.isDragging = false;
    if (!this.isThumbHovered && !this.isThumbFocused) {
      this.thumbTooltipTrigger().hide();
    }
  }

  private isThumbActive(): boolean {
    return this.isDragging || this.isThumbHovered || this.isThumbFocused;
  }
}
