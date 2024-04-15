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
     <div ngpTabset class="bg-white rounded">
      <!-- Tab List -->
      <div ngpTabList class="flex h-12 border-b gap-x-2">
        <button ngpTabButton ngpTabButtonValue="tab1" class="text-neutral-600 font-medium data-[state=active]:text-neutral-900 data-[state=active]:border-b-blue-400 border-b-2 border-transparent text-sm -mb-px outline-none focus-visible:ring-2 ring-blue-400/30 px-4 rounded-tl">Overview</button>
        <button ngpTabButton ngpTabButtonValue="tab2" class="text-neutral-600 font-medium data-[state=active]:text-neutral-900 data-[state=active]:border-b-blue-400 border-b-2 border-transparent text-sm -mb-px outline-none focus-visible:ring-2 ring-blue-400/30 px-4">Features</button>
        <button ngpTabButton ngpTabButtonValue="tab3" class="text-neutral-600 font-medium data-[state=active]:text-neutral-900 data-[state=active]:border-b-blue-400 border-b-2 border-transparent text-sm -mb-px outline-none focus-visible:ring-2 ring-blue-400/30 px-4 rounded-tr">Guides</button>
      </div>

      <!-- Tab Panels -->
      <div ngpTabPanel ngpTabPanelValue="tab1" class="text-neutral-900 text-sm px-4 py-3">Tab 1</div>
      <div ngpTabPanel ngpTabPanelValue="tab2" class="text-neutral-900 text-sm px-4 py-3">Tab 2</div>
      <div ngpTabPanel ngpTabPanelValue="tab3" class="text-neutral-900 text-sm px-4 py-3">Tab 3</div>
     </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<NgpTabsetDirective>;

export const Default: Story = {
  args: {},
};
