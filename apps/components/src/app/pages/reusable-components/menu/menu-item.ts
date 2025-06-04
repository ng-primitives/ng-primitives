import { Component } from '@angular/core';
import { NgpMenuItem } from 'ng-primitives/menu';

@Component({
  selector: 'button[app-menu-item]',
  hostDirectives: [NgpMenuItem],
  template: `
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 8px 6px 14px;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.2s;
      border-radius: 4px;
      min-width: 120px;
      text-align: start;
      outline: none;
      font-size: 14px;
      font-weight: 400;
    }

    :host[data-hover] {
      background-color: var(--ngp-background-active);
    }

    :host[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      z-index: 1;
    }
  `,
})
export class MenuItem {}
