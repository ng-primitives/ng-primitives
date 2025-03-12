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
import { NgpToggleGroup, NgpToggleGroupItem } from 'ng-primitives/toggle-group';
import { NgpToolbar } from 'ng-primitives/toolbar';

@Component({
  selector: 'app-toolbar',
  imports: [
    NgpRovingFocusGroup,
    NgpRovingFocusItem,
    NgIcon,
    NgpButton,
    NgpToolbar,
    NgpToggleGroup,
    NgpToggleGroupItem,
    NgpSeparator,
  ],
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
    [ngpToolbar] {
      display: flex;
      column-gap: 0.25rem;
      align-items: center;
      border-radius: 0.375rem;
      background-color: var(--background);
      box-shadow: var(--button-shadow);
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
      color: var(--text-primary);
    }

    [ngpButton][data-hover] {
      background-color: var(--background-hover);
      border-color: var(--border);
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--focus-ring);
    }

    [ngpButton][data-press] {
      background-color: var(--background-active);
    }

    [ngpButton][data-selected] {
      background-color: var(--background-inverse);
      color: var(--text-inverse);
    }

    [ngpToggleGroup] {
      display: flex;
      column-gap: 0.25rem;
    }

    ng-icon {
      font-size: 1.125rem;
    }

    .divider {
      width: 1px;
      height: 1.5rem;
      background-color: var(--border);
      margin: 0 0.25rem;
    }
  `,
  template: `
    <div ngpToolbar>
      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroDocument" />
      </button>
      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroFolder" />
      </button>

      <div class="divider" ngpSeparator></div>

      <div ngpToggleGroup aria-label="Text alignment">
        <button
          type="button"
          ngpButton
          ngpToggleGroupItem
          ngpToggleGroupItemValue="left"
          aria-label="Align left"
        >
          <ng-icon name="heroBars3BottomLeft" />
        </button>

        <button
          type="button"
          ngpButton
          ngpToggleGroupItem
          ngpToggleGroupItemValue="center"
          aria-label="Align center"
        >
          <ng-icon name="heroBars3" />
        </button>

        <button
          type="button"
          ngpButton
          ngpToggleGroupItem
          ngpToggleGroupItemValue="right"
          aria-label="Align right"
        >
          <ng-icon name="heroBars3BottomRight" />
        </button>
      </div>

      <div class="divider" ngpSeparator></div>

      <button type="button" ngpButton ngpRovingFocusItem>
        <ng-icon name="heroCog6Tooth" />
      </button>
    </div>
  `,
})
export default class ToolbarExample {}
