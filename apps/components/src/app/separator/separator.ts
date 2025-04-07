import { Component } from '@angular/core';
import { NgpSeparator } from 'ng-primitives/separator';

@Component({
  selector: '[app-separator]',
  hostDirectives: [{ directive: NgpSeparator, inputs: ['ngpSeparatorOrientation'] }],
  template: ``,
  styles: `
    :host {
      background-color: var(--ngp-border);
      height: 1px;
    }
  `,
})
export class Separator {}
