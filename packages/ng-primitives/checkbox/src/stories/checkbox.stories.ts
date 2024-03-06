import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, moduleMetadata } from '@storybook/angular';
import { NgpCheckboxDirective } from '../checkbox/checkbox.directive';

const meta: Meta<NgpCheckboxDirective> = {
  title: 'Checkbox',
  component: NgpCheckboxDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgpCheckboxDirective],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
     <button ngpCheckbox ${argsToTemplate(args)}></button>
    `,
  }),
};

export default meta;
type Story = StoryObj<NgpCheckboxDirective>;

export const Default: Story = {
  args: {},
};
