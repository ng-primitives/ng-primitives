import { Directive } from '@angular/core';
import { ngpPreviewCardArrow, providePreviewCardArrowState } from './preview-card-arrow-state';

@Directive({
  selector: '[ngpPreviewCardArrow]',
  exportAs: 'ngpPreviewCardArrow',
  providers: [providePreviewCardArrowState()],
})
export class NgpPreviewCardArrow {
  protected readonly state = ngpPreviewCardArrow({
    // Add your props here based on inputs
  });
}
