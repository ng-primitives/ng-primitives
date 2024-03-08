import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpRovingFocusGroupDirective } from '../roving-focus-group/roving-focus-group.directive';
import { NgpRovingFocusItemDirective } from '../roving-focus-item/roving-focus-item.directive';

const meta: Meta<NgpRovingFocusGroupDirective> = {
  title: 'RovingFocus',
  component: NgpRovingFocusGroupDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgpRovingFocusGroupDirective, NgpRovingFocusItemDirective],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
     <div ngpRovingFocusGroup>
      <button ngpRovingFocusItem>Button 1</button>
      <button ngpRovingFocusItem>Button 2</button>
      <button ngpRovingFocusItem>Button 3</button>
     </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<NgpRovingFocusGroupDirective>;

export const Default: Story = {
  args: {},
};
