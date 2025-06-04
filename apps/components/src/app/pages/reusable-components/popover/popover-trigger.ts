import { Directive, input } from '@angular/core';
import { injectPopoverTriggerState } from 'ng-primitives/popover';
import { NgpPopoverTrigger } from 'ng-primitives/popover';
import { Popover } from './popover';

@Directive({
  selector: '[appPopoverTrigger]',
  hostDirectives: [
    {
      directive: NgpPopoverTrigger,
      inputs: [
        'ngpPopoverTriggerDisabled:appPopoverTriggerDisabled',
        'ngpPopoverTriggerPlacement:appPopoverTriggerPlacement',
        'ngpPopoverTriggerOffset:appPopoverTriggerOffset',
        'ngpPopoverTriggerShowDelay:appPopoverTriggerShowDelay',
        'ngpPopoverTriggerHideDelay:appPopoverTriggerHideDelay',
        'ngpPopoverTriggerFlip:appPopoverTriggerFlip',
        'ngpPopoverTriggerContainer:appPopoverTriggerContainer',
        'ngpPopoverTriggerCloseOnOutsideClick:appPopoverTriggerCloseOnOutsideClick',
        'ngpPopoverTriggerCloseOnEscape:appPopoverTriggerCloseOnEscape',
        'ngpPopoverTriggerScrollBehavior:appPopoverTriggerScrollBehavior',
        'ngpPopoverTriggerContext:appPopoverTrigger',
      ],
    },
  ],
})
export class PopoverTrigger {
  /** Access the popover trigger */
  private readonly popoverTrigger = injectPopoverTriggerState();

  /** Define the content of the popover */
  readonly content = input.required<string>({
    alias: 'appPopoverTrigger',
  });

  constructor() {
    this.popoverTrigger().popover.set(Popover);
  }
}
