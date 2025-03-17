import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'button[app-button]',
  hostDirectives: [{ directive: NgpButton, inputs: ['disabled'] }],
  template: '<ng-content />',
  styles: `
    :host {
    }

    :host[data-hover] {
    }

    :host[data-focus-visible] {
    }

    :host[data-press] {
    }

    :host[data-disabled] {
    }
  `,
})
export class Button {}
