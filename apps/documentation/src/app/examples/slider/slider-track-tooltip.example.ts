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
  styles: `
    :host {
      display: block;
    }

    [ngpSlider] {
      display: flex;
      position: relative;
      width: 200px;
      height: 20px;
      touch-action: none;
      user-select: none;
      align-items: center;
    }

    [ngpSliderTrack] {
      position: relative;
      height: 5px;
      width: 100%;
      border-radius: 999px;
      background-color: var(--ngp-background-secondary);
    }

    /* Increase the click area of the track without changing its visual size */
    [ngpSliderTrack]::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 20px;
      transform: translateY(-50%);
    }

    [ngpSliderRange] {
      position: absolute;
      height: 100%;
      border-radius: 999px;
      background-color: var(--ngp-background-inverse);
    }

    [ngpSliderThumb] {
      position: absolute;
      display: block;
      height: 20px;
      width: 20px;
      border-radius: 10px;
      background-color: white;
      box-shadow: var(--ngp-button-shadow);
      outline: none;
      transform: translateX(-50%);
    }

    [ngpSliderThumb][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 0;
    }

    ::ng-deep .ngp-slider-track-tooltip {
      position: absolute;
      border-radius: 0.25rem;
      background-color: var(--ngp-background-inverse);
      padding: 0.25rem 0.5rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--ngp-text-inverse);
      white-space: nowrap;
    }

    ::ng-deep .ngp-slider-thumb-tooltip {
      position: absolute;
      border-radius: 0.25rem;
      background-color: var(--ngp-background-inverse);
      padding: 0.25rem 0.5rem;
      border: none;
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--ngp-text-inverse);
      white-space: nowrap;
    }
  `,
  template: `
    <div [(ngpSliderValue)]="value" ngpSlider>
      <div
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
        <div ngpSliderRange></div>
      </div>
      <div
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
      <div class="ngp-slider-track-tooltip" ngpTooltip>{{ previewValue() }}</div>
    </ng-template>

    <ng-template #thumbTooltip>
      <div class="ngp-slider-thumb-tooltip" ngpTooltip>{{ value }}</div>
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
