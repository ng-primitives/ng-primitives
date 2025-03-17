import { Component } from '@angular/core';
import { NgpInput } from 'ng-primitives/input';

@Component({
  selector: 'input[app-input]',
  hostDirectives: [{ directive: NgpInput, inputs: ['disabled'] }],
  template: '',
  styles: `
    :host {
    }

    :host[data-focus] {
    }

    :host::placeholder {
    }

    :host[data-disabled] {
    }
  `,
})
export class Input {}
