import { Component } from '@angular/core';
import { NgpToolbar } from 'ng-primitives/toolbar';

@Component({
  selector: 'app-toolbar',
  hostDirectives: [{ directive: NgpToolbar, inputs: ['ngpToolbarOrientation:orientation'] }],
  template: `
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      column-gap: 0.25rem;
      align-items: center;
      border-radius: 0.375rem;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-button-shadow);
      padding: 0.25rem;
    }

    :host[data-orientation='vertical'] {
      flex-direction: column;
      row-gap: 0.25rem;
    }
  `,
})
export class Toolbar {}
