import { Component } from '@angular/core';
import { NgpSeparator } from 'ng-primitives/separator';

@Component({
  standalone: true,
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
      background-color: var(--background);
      padding: 1rem;
      border-radius: 8px;
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
    }

    p {
      color: var(--text-primary);
      margin: 0;
    }

    [ngpSeparator] {
      background-color: var(--border);
      height: 1px;
    }
  `,
})
export default class SeparatorExample {}
