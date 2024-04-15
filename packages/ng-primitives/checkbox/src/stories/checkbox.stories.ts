import { NgIcon, provideIcons } from '@ng-icons/core';
import { radixCheck } from '@ng-icons/radix-icons';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpCheckboxIndicatorDirective } from '../checkbox-indicator/checkbox-indicator.directive';
import { NgpCheckboxInputDirective } from '../checkbox-input/checkbox-input.directive';
import { NgpCheckboxLabelDirective } from '../checkbox-label/checkbox-label.directive';
import { NgpCheckboxDirective } from '../checkbox/checkbox.directive';

const meta: Meta<NgpCheckboxDirective> = {
  title: 'Checkbox',
  component: NgpCheckboxDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        NgpCheckboxDirective,
        NgpCheckboxInputDirective,
        NgpCheckboxIndicatorDirective,
        NgpCheckboxLabelDirective,
        NgIcon,
      ],
      providers: [provideIcons({ radixCheck })],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
     <div ngpCheckbox [(ngpCheckboxChecked)]="checked" class="flex items-center gap-x-4 group select-none">
      <input ngpCheckboxInput />

      <button ngpCheckboxIndicator class="bg-white size-6 rounded flex items-center justify-center group-hover:bg-blue-50 outline-none ring-offset-2 focus-visible:ring ring-blue-400 transition-shadow">
        @if (checked) {
          <ng-icon name="radixCheck" class="text-neutral-700 text-xl" />
        }
      </button>
      <label ngpCheckboxLabel class="text-white">Accept terms and conditions</label>
     </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<NgpCheckboxDirective>;

export const Default: Story = {};
