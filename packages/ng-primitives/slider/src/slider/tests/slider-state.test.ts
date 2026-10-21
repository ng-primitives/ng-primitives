import { Component } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import {
  injectRangeSliderState,
  injectSliderState,
  NgpRangeSlider,
  NgpRangeSliderThumb,
  NgpRangeSliderTrack,
  NgpSlider,
  NgpSliderThumb,
  NgpSliderTrack,
} from 'ng-primitives/slider';
import { describe, expect, it } from 'vitest';

@Component({
  selector: 'app-slider',
  hostDirectives: [{ directive: NgpSlider, inputs: ['ngpSliderValue:value'] }],
  imports: [NgpSliderTrack, NgpSliderThumb],
  template: `
    <div ngpSliderTrack></div>
    <div ngpSliderThumb data-testid="thumb"></div>
  `,
})
class Slider {
  readonly state = injectSliderState();
}

@Component({
  selector: 'app-range-slider',
  hostDirectives: [NgpRangeSlider],
  imports: [NgpRangeSliderTrack, NgpRangeSliderThumb],
  template: `
    <div ngpRangeSliderTrack></div>
    <div ngpRangeSliderThumb data-testid="low"></div>
    <div ngpRangeSliderThumb data-testid="high"></div>
  `,
})
class RangeSlider {
  readonly state = injectRangeSliderState();
}

describe('NgpSlider state', () => {
  it('should move focus to the thumb when focusThumb is called', async () => {
    const { getByTestId, fixture } = await render(`<app-slider [value]="50" />`, {
      imports: [Slider],
    });
    const slider = fixture.debugElement.children[0].componentInstance as Slider;

    slider.state().focusThumb('program');

    expect(getByTestId('thumb')).toHaveFocus();
  });

  it('should set data-press on the thumb while it is pressed', async () => {
    const { getByTestId } = await render(`<app-slider [value]="50" />`, {
      imports: [Slider],
    });
    const thumb = getByTestId('thumb');

    fireEvent.pointerDown(thumb);
    expect(thumb).toHaveAttribute('data-press');

    fireEvent.pointerUp(document);
    expect(thumb).not.toHaveAttribute('data-press');
  });
});

describe('NgpRangeSlider state', () => {
  it('should move focus to the requested thumb when focusThumb is called', async () => {
    const { getByTestId, fixture } = await render(`<app-range-slider />`, {
      imports: [RangeSlider],
    });
    const slider = fixture.debugElement.children[0].componentInstance as RangeSlider;

    slider.state().focusThumb('low', 'program');
    expect(getByTestId('low')).toHaveFocus();

    slider.state().focusThumb('high', 'program');
    expect(getByTestId('high')).toHaveFocus();
  });
});
