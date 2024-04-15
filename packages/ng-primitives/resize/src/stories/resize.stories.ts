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
    <div
      class="flex h-24 min-h-12 w-full min-w-60 resize items-center justify-center overflow-hidden rounded border border-dashed border-blue-300"
      (ngpResize)="dimensions = $event"
    >
      {{ dimensions.width }}x{{ dimensions.height }}
    </div>
  `,
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
