import { Component } from '@angular/core';
import { Tab } from './tab';
import { Tabs } from './tabs';

@Component({
  selector: 'app-tabs-example',
  imports: [Tabs, Tab],
  template: `
    <app-tabs>
      <app-tab value="tab1" label="Tab 1">
        <p>Tab 1 content</p>
      </app-tab>
      <app-tab value="tab2" label="Tab 2">
        <p>Tab 2 content</p>
      </app-tab>
      <app-tab value="tab3" label="Tab 3">
        <p>Tab 3 content</p>
      </app-tab>
    </app-tabs>
  `,
})
export default class App {}
