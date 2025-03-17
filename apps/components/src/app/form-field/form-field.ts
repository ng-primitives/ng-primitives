import { Component } from '@angular/core';
import { NgpFormField } from 'ng-primitives/form-field';

@Component({
  selector: 'app-form-field',
  hostDirectives: [NgpFormField],
  template: `
    <ng-content />
  `,
  styles: `
    :host {
    }
  `,
})
export class FormField {}
