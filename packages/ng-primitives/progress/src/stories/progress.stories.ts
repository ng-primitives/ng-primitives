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
     <div ngpProgress [(ngpProgressValue)]="value">
        <div ngpProgressIndicator [style.width.%]="value"></div>
     </div>
    `,
    styles: [
      `
      [ngpProgress] {
        position: relative;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 99999px;
        width: 300px;
        height: 25px;
      }

      [ngpProgressIndicator] {
        background-color: cornflowerblue;
        height: 100%;
        transition: width 660ms cubic-bezier(0.65, 0, 0.35, 1);
      }
      `,
    ],
  }),
};

export default meta;
type Story = StoryObj<NgpProgressDirective>;

export const Default: Story = {
  args: {
    value: 50,
  },
};
