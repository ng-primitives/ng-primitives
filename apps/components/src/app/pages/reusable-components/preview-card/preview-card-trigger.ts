import { Directive, input } from '@angular/core';
import { injectPreviewCardTriggerState, NgpPreviewCardTrigger } from 'ng-primitives/preview-card';
import { PreviewCard, PreviewCardContent } from './preview-card';

@Directive({
  selector: '[appPreviewCardTrigger]',
  hostDirectives: [
    {
      directive: NgpPreviewCardTrigger,
      inputs: [
        'ngpPreviewCardTriggerDisabled:appPreviewCardTriggerDisabled',
        'ngpPreviewCardTriggerPlacement:appPreviewCardTriggerPlacement',
        'ngpPreviewCardTriggerOffset:appPreviewCardTriggerOffset',
        'ngpPreviewCardTriggerShowDelay:appPreviewCardTriggerShowDelay',
        'ngpPreviewCardTriggerHideDelay:appPreviewCardTriggerHideDelay',
        'ngpPreviewCardTriggerFlip:appPreviewCardTriggerFlip',
        'ngpPreviewCardTriggerContainer:appPreviewCardTriggerContainer',
        'ngpPreviewCardTriggerScrollBehavior:appPreviewCardTriggerScrollBehavior',
        'ngpPreviewCardTriggerContext:appPreviewCardTrigger',
      ],
    },
  ],
})
export class PreviewCardTrigger {
  /** Access the preview card trigger */
  private readonly previewCardTrigger = injectPreviewCardTriggerState<PreviewCardContent>();

  /** Define the content of the preview card */
  readonly content = input.required<PreviewCardContent>({
    alias: 'appPreviewCardTrigger',
  });

  constructor() {
    this.previewCardTrigger().setPreviewCard(PreviewCard);
  }
}
