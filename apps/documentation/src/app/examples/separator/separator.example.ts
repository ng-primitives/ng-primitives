import { Component } from '@angular/core';
import { NgpSeparator } from 'ng-primitives/separator';

@Component({
  selector: 'app-separator',
  imports: [NgpSeparator],
  template: `
    <p>The separator primitive can be used to separate content in a layout.</p>
    <div ngpSeparator></div>
    <p>It supports both horizontal and vertical orientations.</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 300px;
      background-color: var(--ngp-background);
      padding: 1rem;
      border-radius: 8px;
      box-shadow: var(--ngp-shadow);
      border: 1px solid var(--ngp-border);
    }

    p {
      color: var(--ngp-text-primary);
      margin: 0;
    }

    [ngpSeparator] {
      background-color: var(--ngp-border);
      height: 1px;
    }
  `,
})
export default class SeparatorExample {}
