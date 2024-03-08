import { Component } from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpResizeDirective } from '../resize/resize.directive';
import { ResizeEvent } from '../utils/resize';

@Component({
  standalone: true,
  selector: 'ngp-resize-example',
  imports: [NgpResizeDirective],
  template: `
    <div (ngpResize)="dimensions = $event">{{ dimensions.width }}x{{ dimensions.height }}</div>
  `,
  styles: [
    `
      div {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100px;
        border: 1px dashed rgba(0, 0, 0, 0.15);
        border-radius: 4px;
        resize: both;
        overflow: hidden;
      }
    `,
  ],
})
export class ResizeExampleComponent {
  dimensions: ResizeEvent = { width: 0, height: 0 };
}

const meta: Meta<NgpResizeDirective> = {
  title: 'Resize',
  component: NgpResizeDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgpResizeDirective, ResizeExampleComponent],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `<ngp-resize-example />`,
  }),
};

export default meta;
type Story = StoryObj<NgpResizeDirective>;

export const Default: Story = {
  args: {},
};
