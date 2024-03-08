import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpSeparatorDirective } from '../separator/separator.directive';

const meta: Meta<NgpSeparatorDirective> = {
  title: 'Separator',
  component: NgpSeparatorDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgpSeparatorDirective],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
    <div style="width: 100%; max-width: 300px; margin: 0 15px">

    <div class="text" style="font-weight: 500">
      Ng Primitives
    </div>

    <div class="text">An open-source UI component library.</div>

    <div ngpSeparator style="margin: 15px 0"></div>

    <div style="display: flex; height: 20px; align-items: center">
      <div class="text">Blog</div>

      <div ngpSeparator ngpSeparatorDecorative ngpSeparatorOrientation="vertical" style="margin: 0 15px"></div>

      <div class="text">Docs</div>

      <div ngpSeparator ngpSeparatorDecorative ngpSeparatorOrientation="vertical" style="margin: 0 15px"></div>

      <div class="text">Source</div>
    </div>
  </div>
    `,
    styles: [
      `
    [ngpSeparator] {
      background-color: rgba(0, 0, 0, 0.5);
    }

    [ngpSeparator][data-orientation='horizontal'] {
      height: 1px;
      width: 100%;
    }
    [ngpSeparator][data-orientation='vertical'] {
      height: 100%;
      width: 1px;
    }

    .text {
      color: white;
      font-size: 15px;
      line-height: 20px;
    }`,
    ],
  }),
};

export default meta;
type Story = StoryObj<NgpSeparatorDirective>;

export const Default: Story = {
  args: {},
};
