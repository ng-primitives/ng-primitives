import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideExternalLink, lucideHome, lucidePointer } from '@ng-icons/lucide';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button-link-example',
  imports: [NgpButton, RouterLink, NgIcon],
  providers: [provideIcons({ lucideHome, lucidePointer, lucideExternalLink })],
  template: `
    <a ngpButton href="/">
      <ng-icon name="lucideHome" />
      Home
    </a>

    <a ngpButton routerLink="/primitives/button">
      <ng-icon name="lucidePointer" />
      Button Docs
    </a>

    <a ngpButton href="https://github.com/ng-primitives/ng-primitives" target="_blank">
      GitHub
      <ng-icon name="lucideExternalLink" />
    </a>

    <a [disabled]="true" ngpButton href="/disabled-link">Disabled Link</a>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }

    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      border: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      gap: 0.5rem;
      text-decoration: none;
    }

    [ngpButton][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    [ngpButton][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpButton][data-disabled] {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  `,
})
export default class ButtonLinkExample {}
