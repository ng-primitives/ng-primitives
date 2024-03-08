import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpTabButtonDirective } from '../tab-button/tab-button.directive';
import { NgpTabListDirective } from '../tab-list/tab-list.directive';
import { NgpTabPanelDirective } from '../tab-panel/tab-panel.directive';
import { NgpTabsetDirective } from '../tabset/tabset.directive';

const meta: Meta<NgpTabsetDirective> = {
  title: 'Tabs',
  component: NgpTabsetDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        NgpTabsetDirective,
        NgpTabPanelDirective,
        NgpTabListDirective,
        NgpTabButtonDirective,
      ],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
     <div ngpTabset>
      <!-- Tab List -->
      <div ngpTabList>
        <button ngpTabButton ngpTabButtonValue="tab1">Tab 1</button>
        <button ngpTabButton ngpTabButtonValue="tab2">Tab 2</button>
        <button ngpTabButton ngpTabButtonValue="tab3">Tab 3</button>
      </div>

      <!-- Tab Panels -->
      <div ngpTabPanel ngpTabPanelValue="tab1">Tab 1</div>
      <div ngpTabPanel ngpTabPanelValue="tab2">Tab 2</div>
      <div ngpTabPanel ngpTabPanelValue="tab3">Tab 3</div>
     </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<NgpTabsetDirective>;

export const Default: Story = {
  args: {},
};
