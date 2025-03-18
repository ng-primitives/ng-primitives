import { Component } from '@angular/core';
import { Slider } from './slider';

@Component({
  selector: 'app-slider-example',
  imports: [Slider],
  template: `
    <app-slider />
  `,
})
export default class App {}
