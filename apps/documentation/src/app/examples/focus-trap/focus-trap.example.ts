import { Component } from '@angular/core';
import { NgpFocusTrap } from 'ng-primitives/focus-trap';

@Component({
  standalone: true,
  selector: 'app-focus-trap',
  imports: [NgpFocusTrap],
  template: `
    <div
      style="background-color: #fff; border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 8px; padding: 1rem; display: flex; flex-direction: column;"
      ngpFocusTrap
    >
      <button>Focusable Element 1</button>
      <button>Focusable Element 2</button>
      <button>Focusable Element 3</button>
    </div>
  `,
})
export default class FocusTrapExample {}
