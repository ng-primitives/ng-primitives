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
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 90%;
    }
  `,
})
export class FormField {}
