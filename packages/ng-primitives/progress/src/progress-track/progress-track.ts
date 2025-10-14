import { Directive } from '@angular/core';
import { ngpProgressTrackPattern, provideProgressTrackPattern } from './progress-track-pattern';

@Directive({
  selector: '[ngpProgressTrack]',
  exportAs: 'ngpProgressTrack',
  providers: [provideProgressTrackPattern(NgpProgressTrack, instance => instance.pattern)],
})
export class NgpProgressTrack {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpProgressTrackPattern();
}
