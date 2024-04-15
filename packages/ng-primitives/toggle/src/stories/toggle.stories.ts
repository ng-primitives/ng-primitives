import { NgIcon, provideIcons } from '@ng-icons/core';
import { radixFontItalic } from '@ng-icons/radix-icons';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpToggleDirective } from '../toggle/toggle.directive';

const meta: Meta<NgpToggleDirective> = {
  title: 'Toggle',
  component: NgpToggleDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgpToggleDirective, NgIcon],
      providers: [provideIcons({ radixFontItalic })],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
     <button ngpToggle class="bg-white text-blue-400 size-10 rounded transition-colors flex items-center justify-center hover:bg-blue-100 data-[state=on]:bg-blue-400 data-[state=on]:text-white">
      <ng-icon name="radixFontItalic"/>
     </button>
    `,
  }),
};

export default meta;
type Story = StoryObj<NgpToggleDirective>;

export const Default: Story = {
  args: {},
};
