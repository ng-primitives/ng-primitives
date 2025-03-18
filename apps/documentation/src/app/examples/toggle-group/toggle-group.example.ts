import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBars3, heroBars3BottomLeft, heroBars3BottomRight } from '@ng-icons/heroicons/outline';
import { NgpButton } from 'ng-primitives/button';
import { NgpToggleGroup, NgpToggleGroupItem } from 'ng-primitives/toggle-group';

@Component({
  selector: 'app-toggle-group',
  imports: [NgpToggleGroup, NgpToggleGroupItem, NgpButton, NgIcon],
  viewProviders: [
    provideIcons({
      heroBars3BottomLeft,
      heroBars3,
      heroBars3BottomRight,
    }),
  ],
  template: `
    <div ngpToggleGroup aria-label="Text alignment">
      <button ngpButton ngpToggleGroupItem ngpToggleGroupItemValue="left" aria-label="Left align">
        <ng-icon name="heroBars3BottomLeft" />
      </button>

      <button
        ngpButton
        ngpToggleGroupItem
        ngpToggleGroupItemValue="center"
        aria-label="Center align"
      >
        <ng-icon name="heroBars3" />
      </button>

      <button ngpButton ngpToggleGroupItem ngpToggleGroupItemValue="right" aria-label="Right align">
        <ng-icon name="heroBars3BottomRight" />
      </button>
    </div>
  `,
  styles: `
    [ngpToggleGroup] {
      display: flex;
      column-gap: 0.25rem;
      align-items: center;
      border-radius: 0.375rem;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-button-shadow);
      padding: 0.25rem;
    }

    [ngpToggleGroupItem] {
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
    }

    [ngpToggleGroupItem][data-hover] {
      background-color: var(--ngp-background-hover);
      border-color: var(--ngp-border);
    }

    [ngpToggleGroupItem][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    [ngpToggleGroupItem][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpToggleGroupItem][data-selected] {
      background-color: var(--ngp-background-inverse);
      color: var(--ngp-text-inverse);
      border-color: transparent;
    }

    ng-icon {
      font-size: 1.125rem;
    }
  `,
})
export default class ToggleGroupExample {}
