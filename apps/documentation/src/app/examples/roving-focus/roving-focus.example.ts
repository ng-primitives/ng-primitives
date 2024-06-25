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
import { NgpRovingFocusGroup, NgpRovingFocusItem } from 'ng-primitives/roving-focus';

@Component({
  standalone: true,
  selector: 'app-roving-focus',
  imports: [NgpRovingFocusGroup, NgpRovingFocusItem, NgIcon],
  viewProviders: [
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
      background-color: rgb(255 255 255);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
      padding: 0.25rem;
    }

    [ngpRovingFocusItem] {
      display: flex;
      width: 2rem;
      height: 2rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
      border: none;
      background: transparent;
      outline: none;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpRovingFocusItem]:hover {
      background-color: rgb(250 250 250);
      box-shadow: 0 0 0 1px rgb(0 0 0 / 0.05);
    }

    [ngpRovingFocusItem]:focus-visible {
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px rgb(59 130 246);
    }

    [ngpRovingFocusItem]:active {
      background-color: rgb(245 245 245);
    }

    ng-icon {
      font-size: 1.125rem;
      color: rgb(64 64 64);
    }

    .divider {
      width: 1px;
      height: 1.5rem;
      background-color: rgb(229 229 229);
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
      <button type="button" ngpRovingFocusItem>
        <ng-icon name="heroDocument" />
      </button>
      <button type="button" ngpRovingFocusItem>
        <ng-icon name="heroFolder" />
      </button>

      <div class="divider"></div>

      <button type="button" ngpRovingFocusItem>
        <ng-icon name="heroBars3BottomLeft" />
      </button>

      <button type="button" ngpRovingFocusItem>
        <ng-icon name="heroBars3" />
      </button>

      <button type="button" ngpRovingFocusItem>
        <ng-icon name="heroBars3BottomRight" />
      </button>

      <div class="divider"></div>

      <button type="button" ngpRovingFocusItem>
        <ng-icon name="heroCog6Tooth" />
      </button>
    </div>
  `,
})
export default class RovingFocusExample {}
