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
import { Toolbar } from './toolbar';
import { ToolbarButton } from './toolbar-button';

@Component({
  selector: 'app-toolbar-example',
  imports: [
    Toolbar,
    ToolbarButton,
    NgIcon,
    NgpButton,
    NgpRovingFocusGroup,
    NgpRovingFocusItem,
    NgpSeparator,
    NgpToggleGroup,
    NgpToggleGroupItem,
  ],
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
  template: `
    <app-toolbar>
      <button app-toolbar-button>
        <ng-icon name="heroDocument" />
      </button>
      <button app-toolbar-button>
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

      <button app-toolbar-button>
        <ng-icon name="heroCog6Tooth" />
      </button>
    </app-toolbar>
  `,
  styles: `
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
      color: var(--ngp-text-primary);
      cursor: pointer;
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

    [ngpButton][data-selected] {
      background-color: var(--ngp-background-inverse);
      color: var(--ngp-text-inverse);
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
      background-color: var(--ngp-border);
      margin: 0 0.25rem;
    }
  `,
})
export default class App {}
