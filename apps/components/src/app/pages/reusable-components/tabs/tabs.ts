import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChildren, model } from '@angular/core';
import { NgpTabButton, NgpTabList, NgpTabPanel, NgpTabset } from 'ng-primitives/tabs';
import { Tab } from './tab';

@Component({
  selector: 'app-tabs',
  imports: [NgpTabset, NgpTabButton, NgpTabList, NgpTabPanel, NgTemplateOutlet],
  template: `
    <div [(ngpTabsetValue)]="value" ngpTabset>
      <div ngpTabList>
        @for (tab of tabs(); track tab.label) {
          <button [ngpTabButtonValue]="tab.value()" ngpTabButton>{{ tab.label() }}</button>
        }
      </div>

      @for (tab of tabs(); track tab.label) {
        <div [ngpTabPanelValue]="tab.value()" ngpTabPanel>
          <ng-container [ngTemplateOutlet]="tab.content()" />
        </div>
      }
    </div>
  `,
  styles: `
    [ngpTabset] {
      width: 100%;
      max-width: 512px;
      border-radius: 0.75rem;
      background-color: var(--ngp-background);
      padding: 0.25rem 1rem;
      box-shadow: var(--ngp-button-shadow);
    }

    [ngpTabList] {
      display: flex;
      gap: 1.5rem;
      border-bottom: 1px solid var(--ngp-border);
    }

    [ngpTabButton] {
      border: none;
      background-color: transparent;
      margin-bottom: -1px;
      border-bottom: 2px solid transparent;
      padding: 0.5rem 0;
      outline: none;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpTabButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpTabButton][data-active] {
      border-color: var(--ngp-background-inverse);
      color: var(--ngp-text-primary);
    }

    [ngpTabPanel] {
      padding: 0.5rem 0;
      outline: none;
    }

    [ngpTabPanel]:not([data-active]) {
      display: none;
    }
  `,
})
export class Tabs {
  /**
   * The value of the selected tab.
   */
  readonly value = model<string>();

  /**
   * The tabs in the group.
   */
  readonly tabs = contentChildren(Tab);
}
