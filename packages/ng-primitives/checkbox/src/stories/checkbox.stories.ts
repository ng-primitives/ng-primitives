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
      <button ngpCheckboxIndicator>
        @if (checked) {
          <ng-icon name="radixCheck"/>
        }
      </button>
      <label ngpCheckboxLabel>Accept terms and conditions</label>
     </div>
    `,
    styles: [
      `
      [ngpCheckbox] {
        display: flex;
        align-items: center;
      }

      [ngpCheckboxIndicator] {
        all: unset;
        background-color: white;
        width: 25px;
        height: 25px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        color: #6550b9;
      }

      [ngpCheckboxIndicator]:hover {
        background-color: #f4f0fe;
      }

      [ngpCheckboxIndicator]:focus {
        box-shadow: 0 0 0 2px black;
      }

      [ngpCheckboxLabel] {
        color: white;
        padding-left: 15px;
        font-size: 15px;
        line-height: 1;
      }
    `,
    ],
  }),
};

export default meta;
type Story = StoryObj<NgpCheckboxDirective>;

export const Default: Story = {};
