import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBold, lucideItalic, lucideStrikethrough, lucideUnderline } from '@ng-icons/lucide';
import { NgpButton } from 'ng-primitives/button';
import { NgpToggleGroup, NgpToggleGroupItem } from 'ng-primitives/toggle-group';

@Component({
  standalone: true,
  selector: 'app-toggle-group',
  imports: [NgpToggleGroup, NgpToggleGroupItem, NgpButton, NgIcon],
  viewProviders: [provideIcons({ lucideBold, lucideItalic, lucideUnderline, lucideStrikethrough })],
  template: `
    <div ngpToggleGroup ngpToggleGroupType="multiple" aria-label="Text formatting">
      <button ngpButton ngpToggleGroupItem ngpToggleGroupItemValue="bold" aria-label="Bold">
        <ng-icon name="lucideBold" />
      </button>

      <button ngpButton ngpToggleGroupItem ngpToggleGroupItemValue="italic" aria-label="Italic">
        <ng-icon name="lucideItalic" />
      </button>

      <button
        ngpButton
        ngpToggleGroupItem
        ngpToggleGroupItemValue="underline"
        aria-label="Underline"
      >
        <ng-icon name="lucideUnderline" />
      </button>

      <button
        ngpButton
        ngpToggleGroupItem
        ngpToggleGroupItemValue="strikethrough"
        aria-label="Strikethrough"
      >
        <ng-icon name="lucideStrikethrough" />
      </button>
    </div>
  `,
  styles: `
    [ngpToggleGroup] {
      display: flex;
      column-gap: 0.25rem;
      align-items: center;
      border-radius: 0.375rem;
      background-color: var(--background);
      box-shadow: var(--button-shadow);
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
      color: var(--text-primary);
    }

    [ngpToggleGroupItem][data-hover] {
      background-color: var(--background-hover);
      border-color: var(--border);
    }

    [ngpToggleGroupItem][data-focus-visible] {
      outline: 2px solid var(--focus-ring);
    }

    [ngpToggleGroupItem][data-press] {
      background-color: var(--background-active);
    }

    [ngpToggleGroupItem][data-selected] {
      background-color: var(--background-inverse);
      color: var(--text-inverse);
      border-color: transparent;
    }

    ng-icon {
      font-size: 1.125rem;
    }
  `,
})
export default class ToggleGroupExample {}
