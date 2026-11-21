import { Directive } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { NGP_DRAWER_DATA_ATTRIBUTES } from '../drawer.constants';

@Directive({
  selector: '[ngpDrawerSwipeIgnore]',
  standalone: true,
})
export class NgpDrawerSwipeIgnore {
  constructor() {
    dataBinding(injectElementRef<HTMLElement>(), NGP_DRAWER_DATA_ATTRIBUTES.swipeIgnore, true);
  }
}
