import { Directive } from '@angular/core';
import { ngpProgressTrack } from './progress-track-state';

@Directive({
  selector: '[ngpProgressTrack]',
  exportAs: 'ngpProgressTrack',
})
export class NgpProgressTrack {
  constructor() {
    ngpProgressTrack({});
  }
}
