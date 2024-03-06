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
     <div ngpCheckbox [(ngpCheckboxChecked)]="checked">
      <input ngpCheckboxInput />
      <span ngpCheckboxIndicator>
        <ng-icon name="radixCheck"/>
      </span>
      <label ngpCheckboxLabel>Accept terms and conditions</label>
     </div>
    `,
    styles: [
      `
      [ngpCheckbox] {
        display: inline-flex;
        align-items: center;
      }

      [ngpCheckboxIndicator] {
        background-color: white;
        width: 25px;
        height: 25px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #d1d5db;
      }

      [ngpCheckboxLabel] {
        padding-left: 15px;
      }
    `,
    ],
  }),
};

export default meta;
type Story = StoryObj<NgpCheckboxDirective>;

export const Default: Story = {
  args: {
    checked: true,
  },
};
