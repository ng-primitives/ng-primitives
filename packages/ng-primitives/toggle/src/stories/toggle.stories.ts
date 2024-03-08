import { NgIcon, provideIcons } from '@ng-icons/core';
import { radixFontItalic } from '@ng-icons/radix-icons';
import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate, moduleMetadata } from '@storybook/angular';
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
     <button ngpToggle ${argsToTemplate(args)}>
      <ng-icon name="radixFontItalic"/>
     </button>
    `,
    styles: [
      `
    [ngpToggle] {
      all: unset;
      background-color: white;
      color: rgb(101, 99, 109);
      height: 35px;
      width: 35px;
      border-radius: 4px;
      display: flex;
      font-size: 15px;
      line-height: 1;
      align-items: center;
      justify-content: center;
      box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 10px;
    }

    [ngpToggle]:hover {
      background-color: rgb(244, 240, 254);
    }

    [ngpToggle][data-state='on'] {
      background-color: rgb(212, 202, 254);
      color: rgb(47, 38, 95);
    }

    [ngpToggle]:focus {
      box-shadow: 0 0 0 2px black;
    }
    `,
    ],
  }),
};

export default meta;
type Story = StoryObj<NgpToggleDirective>;

export const Default: Story = {
  args: {},
};
