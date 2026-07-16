import { Directive } from '@angular/core';

@Directive({
  selector: '[ngpDrawerSwipeIgnore]',
  standalone: true,
  host: { 'data-ngp-drawer-swipe-ignore': '' },
})
export class NgpDrawerSwipeIgnore {}
