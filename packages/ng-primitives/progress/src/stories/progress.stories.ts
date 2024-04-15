import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpProgressIndicatorDirective } from '../progress-indicator/progress-indicator.directive';
import { NgpProgressDirective } from '../progress/progress.directive';

const meta: Meta<NgpProgressDirective> = {
  title: 'Progress',
  component: NgpProgressDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgpProgressDirective, NgpProgressIndicatorDirective],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
     <div ngpProgress [(ngpProgressValue)]="value" class="relative overflow-hidden bg-white/5 rounded-lg w-80 h-6 border border-white/10">
        <div ngpProgressIndicator class="bg-blue-400 h-full transition-all" [style.width.%]="value"></div>
     </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<NgpProgressDirective>;

export const Default: Story = {
  args: {
    value: 50,
  },
};
