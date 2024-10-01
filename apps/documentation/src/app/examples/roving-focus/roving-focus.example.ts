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

@Component({
  standalone: true,
  selector: 'app-roving-focus',
  imports: [NgpRovingFocusGroup, NgpRovingFocusItem, NgIcon, NgpButton],
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
    :host {
      --roving-focus-group-background-color: rgb(255 255 255);
      --roving-focus-group-hover-background-color: rgb(250 250 250);
      --roving-focus-group-pressed-background-color: rgb(245 245 245);
      --roving-focus-group-icon-color: rgb(64 64 64);
      --roving-focus-group-divider-color: rgb(229 229 229);

      --roving-focus-group-background-color-dark: rgb(43 43 47);
      --roving-focus-group-hover-background-color-dark: rgb(63 63 70);
      --roving-focus-group-pressed-background-color-dark: rgb(39 39 42);
      --roving-focus-group-icon-color-dark: rgb(225 225 225);
      --roving-focus-group-divider-color-dark: rgb(96 96 102);
    }

    [ngpRovingFocusGroup] {
      display: flex;
      column-gap: 0.25rem;
      align-items: center;
      border-radius: 0.375rem;
      background-color: light-dark(
        var(--roving-focus-group-background-color),
        var(--roving-focus-group-background-color-dark)
      );
      box-shadow:
        0 1px 3px 0 light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1)),
        0 1px 2px -1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05));
      padding: 0.25rem;
    }

    [ngpButton] {
      display: flex;
      width: 2rem;
      height: 2rem;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
      border: none;
      background: transparent;
      outline: none;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpButton][data-hover] {
      background-color: light-dark(
        var(--roving-focus-group-hover-background-color),
        var(--roving-focus-group-hover-background-color-dark)
      );
      box-shadow: 0 0 0 1px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05));
    }

    [ngpButton][data-focus-visible] {
      box-shadow:
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05)),
        0 0 0 2px rgb(59 130 246);
    }

    [ngpButton][data-press] {
      background-color: light-dark(
        var(--roving-focus-group-pressed-background-color),
        var(--roving-focus-group-pressed-background-color-dark)
      );
    }

    ng-icon {
      font-size: 1.125rem;
      color: light-dark(
        var(--roving-focus-group-icon-color),
        var(--roving-focus-group-icon-color-dark)
      );
    }

    .divider {
      width: 1px;
      height: 1.5rem;
      background-color: light-dark(
        var(--roving-focus-group-divider-color),
        var(--roving-focus-group-divider-color-dark)
      );
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

      <div class="divider"></div>

      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroBars3BottomLeft" />
      </button>

      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroBars3" />
      </button>

      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroBars3BottomRight" />
      </button>

      <div class="divider"></div>

      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroCog6Tooth" />
      </button>
    </div>
  `,
})
export default class RovingFocusExample {}
