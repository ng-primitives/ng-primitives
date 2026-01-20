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

    ::ng-deep .ngp-slider-tooltip {
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
      <div ngpSliderTrack>
        <div ngpSliderRange></div>
      </div>
      <div
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
      <div class="ngp-slider-tooltip" ngpTooltip>{{ value }}</div>
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
