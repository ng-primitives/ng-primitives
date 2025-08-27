import { Component } from '@angular/core';
import { RangeSlider } from './range-slider';

@Component({
  selector: 'app-range-slider-example',
  imports: [RangeSlider],
  template: `
    <app-range-slider aria-label="Range slider control" />
  `,
})
export default class App {}
