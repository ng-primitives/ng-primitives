import { DOCUMENT } from '@angular/common';
import { DestroyRef, Directive, inject } from '@angular/core';
import { DrawerStackService } from '../internal/drawer-stack.service';
import {
  ngpDrawerVirtualKeyboard,
  provideDrawerVirtualKeyboardState,
} from '../internal/virtual-keyboard/keyboard-context';

@Directive({
  selector: 'ng-container[ngpDrawerVirtualKeyboard]',
  standalone: true,
  providers: [provideDrawerVirtualKeyboardState({ inherit: false })],
})
export class NgpDrawerVirtualKeyboard {
  private readonly context = ngpDrawerVirtualKeyboard({
    document: inject(DOCUMENT),
    stack: inject(DrawerStackService),
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => this.context.destroy());
  }
}
