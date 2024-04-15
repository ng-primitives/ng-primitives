import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpSwitchThumbDirective } from '../switch-thumb/switch-thumb.directive';
import { NgpSwitchDirective } from '../switch/switch.directive';

const meta: Meta<NgpSwitchDirective> = {
  title: 'Switch',
  component: NgpSwitchDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgpSwitchDirective, NgpSwitchThumbDirective],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
    <div class="flex items-center gap-x-4">
      <label for="mobile-data" class="text-white">
        Mobile Data
      </label>
      <button ngpSwitch id="mobile-data" class="w-10 h-6 bg-blue-300/10 rounded-full relative data-[state=checked]:bg-blue-400 transition-colors">
        <span ngpSwitchThumb class="block size-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[18px]"></span>
      </button>
    </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<NgpSwitchDirective>;

export const Default: Story = {
  args: {},
};
