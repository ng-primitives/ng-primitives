import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBars3,
  heroBars3BottomLeft,
  heroBars3BottomRight,
  heroCog6Tooth,
  heroDocument,
  heroFolder,
} from '@ng-icons/heroicons/outline';
import { NgpButton } from 'ng-primitives/button';
import { NgpRovingFocusGroup, NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { NgpSeparator } from 'ng-primitives/separator';

@Component({
  selector: 'app-roving-focus',
  imports: [NgpRovingFocusGroup, NgpRovingFocusItem, NgIcon, NgpButton, NgpSeparator],
  providers: [
    provideIcons({
      heroDocument,
      heroFolder,
      heroBars3BottomLeft,
      heroBars3,
      heroBars3BottomRight,
      heroCog6Tooth,
    }),
  ],
  styles: `
    [ngpRovingFocusGroup] {
      display: flex;
      column-gap: 0.25rem;
      align-items: center;
      border-radius: 0.375rem;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-button-shadow);
      padding: 0.25rem;
    }

    [ngpButton] {
      display: flex;
      width: 2rem;
      height: 2rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
      border: 1px solid transparent;
      background: transparent;
      outline: none;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;
    }

    [ngpButton][data-hover] {
      background-color: var(--ngp-background-hover);
      border-color: var(--ngp-border);
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    [ngpButton][data-press] {
      background-color: var(--ngp-background-active);
    }

    ng-icon {
      font-size: 1.125rem;
      color: var(--ngp-text-primary);
    }

    .divider {
      width: 1px;
      height: 1.5rem;
      background-color: var(--ngp-border);
      margin: 0 0.25rem;
    }
  `,
  template: `
    <div
      ngpRovingFocusGroup
      ngpRovingFocusGroupOrientation="horizontal"
      ngpRovingFocusGroupWrap="true"
      ngpRovingFocusGroupHomeEnd="true"
    >
      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroDocument" />
      </button>
      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroFolder" />
      </button>

      <div class="divider" ngpSeparator></div>

      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroBars3BottomLeft" />
      </button>

      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroBars3" />
      </button>

      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroBars3BottomRight" />
      </button>

      <div class="divider" ngpSeparator></div>

      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroCog6Tooth" />
      </button>
    </div>
  `,
})
export default class RovingFocusExample {}
