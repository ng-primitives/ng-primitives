import { Component, signal } from '@angular/core';
import { NgpTabButton, NgpTabList, NgpTabPanel, NgpTabset } from 'ng-primitives/tabs';

@Component({
  standalone: true,
  selector: 'app-tabs',
  imports: [NgpTabset, NgpTabList, NgpTabButton, NgpTabPanel],
  styles: `
    :host {
      --tabset-background-color: rgb(255 255 255);
      --tablist-border-color: rgb(229 231 235);
      --tab-button-active-border-color: rgb(9 9 11);
      --tab-button-active-color: rgb(9 9 11);

      --tabset-background-color-dark: rgb(43 43 47);
      --tablist-border-color-dark: rgb(96 96 102);
      --tab-button-active-border-color-dark: rgb(255 255 255);
      --tab-button-active-color-dark: rgb(255 255 255);
    }

    :host {
      display: contents;
    }

    [ngpTabset] {
      width: 100%;
      max-width: 512px;
      border-radius: 0.75rem;
      background-color: light-dark(
        var(--tabset-background-color),
        var(--tabset-background-color-dark)
      );
      padding: 0.25rem 1rem;
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    [ngpTabList] {
      display: flex;
      gap: 1.5rem;
      border-bottom: 1px solid
        light-dark(var(--tablist-border-color), var(--tablist-border-color-dark));
    }

    [ngpTabButton] {
      border: none;
      background-color: transparent;
      margin-bottom: -1px;
      border-bottom: 2px solid transparent;
      padding: 0.5rem 0;
      outline: none;
      transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpTabButton][data-focus-visible='true'] {
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px rgb(59 130 246);
    }

    [ngpTabButton][data-active='true'] {
      border-color: light-dark(
        var(--tab-button-active-border-color),
        var(--tab-button-active-border-color-dark)
      );
      color: light-dark(var(--tab-button-active-color), var(--tab-button-active-color-dark));
    }

    [ngpTabPanel] {
      padding: 0.5rem 0;
      outline: none;
    }

    [ngpTabPanel][data-active='false'] {
      display: none;
    }
  `,
  template: `
    <div [(ngpTabsetValue)]="selectedTab" ngpTabset>
      <div ngpTabList>
        <button ngpTabButton ngpTabButtonValue="overview">Overview</button>
        <button ngpTabButton ngpTabButtonValue="features">Features</button>
        <button ngpTabButton ngpTabButtonValue="pricing">Pricing</button>
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
