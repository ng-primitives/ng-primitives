import { Directive } from '@angular/core';
import { ngpProgressTrack, provideProgressTrackState } from './progress-track-state';

@Directive({
  selector: '[ngpProgressTrack]',
  exportAs: 'ngpProgressTrack',
  providers: [provideProgressTrackState()],
})
export class NgpProgressTrack {
  constructor() {
    ngpProgressTrack(this);
  }
}
