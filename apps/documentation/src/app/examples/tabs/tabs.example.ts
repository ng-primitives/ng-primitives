import { Component, signal } from '@angular/core';
import { NgpTabButton, NgpTabList, NgpTabPanel, NgpTabset } from 'ng-primitives/tabs';

@Component({
  selector: 'app-tabs',
  imports: [NgpTabset, NgpTabList, NgpTabButton, NgpTabPanel],
  styles: `
    :host {
      display: contents;
    }

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

    [ngpTabButton][data-disabled] {
      color: var(--ngp-text-disabled);
      cursor: not-allowed;
    }

    [ngpTabPanel] {
      padding: 0.5rem 0;
      outline: none;
    }

    [ngpTabPanel]:not([data-active]) {
      display: none;
    }
  `,
  template: `
    <div [(ngpTabsetValue)]="selectedTab" ngpTabset>
      <div ngpTabList>
        <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
        <button ngpTabButton ngpTabButtonValue="features">Features</button>
        <button ngpTabButton ngpTabButtonValue="pricing">Pricing</button>
        <button ngpTabButton ngpTabButtonValue="disabled" ngpTabButtonDisabled>Disabled</button>
      </div>

      <div ngpTabPanel ngpTabPanelValue="overview">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam ultricies lacinia arcu,
          in dignissim magna mollis in. Proin ac faucibus sem. Aliquam sit amet augue non risus
          commodo volutpat id sit amet nisi. Integer posuere nisl in ligula faucibus vestibulum.
          Nulla facilisi. Aliquam erat volutpat.
        </p>
      </div>

      <div ngpTabPanel ngpTabPanelValue="features">
        <p>
          Cras eget sem ac velit pellentesque lobortis at in ex. Vestibulum nisl diam, eleifend eget
          malesuada a, cursus id ante. Morbi fringilla, metus nec consectetur maximus, leo purus
          gravida est, eu fringilla dui quam fermentum sapien. Vivamus tempus ullamcorper lectus,
          nec cursus sapien consectetur vel.
        </p>
      </div>

      <div ngpTabPanel ngpTabPanelValue="pricing">
        <p>
          Praesent vehicula erat ac massa egestas viverra. Pellentesque urna magna, consectetur
          convallis ante vel, posuere aliquet arcu. Duis eu nulla id sapien lobortis bibendum eget
          vel velit. Donec sed nisi ac lacus placerat iaculis. Donec blandit eros sit amet nibh
          accumsan cursus. Morbi sit amet ex et enim tempus porttitor non eu erat.
        </p>
      </div>

      <div ngpTabPanel ngpTabPanelValue="disabled">
        <p>Disabled content</p>
      </div>
    </div>
  `,
})
export default class TabsExample {
  /**
   * The selected tab
   */
  readonly selectedTab = signal<Tab>('overview');
}

type Tab = 'overview' | 'features' | 'pricing';
