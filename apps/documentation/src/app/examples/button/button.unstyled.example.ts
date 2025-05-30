import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button',
  imports: [NgpButton],
  template: `
    <button ngpButton>Button</button>
  `,
})
export default class ButtonExample {}
