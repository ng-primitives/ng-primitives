import { NgIcon, provideIcons } from '@ng-icons/core';
import { radixCross2, radixRowSpacing } from '@ng-icons/radix-icons';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpCollapsibleContentDirective } from '../collapsible-content/collapsible-content.directive';
import { NgpCollapsibleTriggerDirective } from '../collapsible-trigger/collapsible-trigger.directive';
import { NgpCollapsibleDirective } from '../collapsible/collapsible.directive';

const meta: Meta<NgpCollapsibleDirective> = {
  title: 'Collapsible',
  component: NgpCollapsibleDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        NgpCollapsibleDirective,
        NgpCollapsibleTriggerDirective,
        NgpCollapsibleContentDirective,
        NgIcon,
      ],
      providers: [provideIcons({ radixRowSpacing, radixCross2 })],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
     <div ngpCollapsible [(ngpCollapsibleOpen)]="open">
      <div style="display: flex; align-items: center; justify-content: space-between">
        <span class="text" style="color: white">
          &#64;angular starred 3 repositories
        </span>

          <button ngpCollapsibleTrigger>
            <ng-icon [name]="open ? 'radixCross2' : 'radixRowSpacing'" />
          </button>
      </div>

      <div class="repository">
        <span class="text">&#64;ng-primitives/collapsible</span>
      </div>

      <div ngpCollapsibleContent>
        <div class="repository">
          <span class="text">&#64;ng-primitives/switch</span>
        </div>
        <div class="repository">
          <span class="text">&#64;ng-primitives/thumb</span>
        </div>
      </div>
     </div>
    `,
    styles: [
      `
[ngpCollapsible] {
  width: 300px;
}

[ngpCollapsibleTrigger] {
  all: unset;
  font-family: inherit;
  border-radius: 100%;
  height: 25px;
  width: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgb(101, 80, 185);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 10px;
}

[ngpCollapsibleTrigger][data-state='closed'] {
  background-color: white;
}

[ngpCollapsibleTrigger][data-state='open'] {
  background-color: rgb(244, 240, 254);
}

[ngpCollapsibleTrigger]:hover {
  background-color: rgb(244, 240, 254);
}

[ngpCollapsibleTrigger]:focus {
  box-shadow: 0 0 0 2px black;
}

.text {
  color: rgb(101, 80, 185);
  font-size: 15px;
  line-height: 25px;
}

.repository {
  background-color: white;
  border-radius: 4px;
  margin: 10px 0;
  padding: 10px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 10px;
}
      `,
    ],
  }),
};

export default meta;
type Story = StoryObj<NgpCollapsibleDirective>;

export const Default: Story = {
  args: {},
};
