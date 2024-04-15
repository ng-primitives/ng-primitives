import {
  NgpRadioGroupDirective,
  NgpRadioIndicatorDirective,
  NgpRadioItemDirective,
} from '@ng-primitives/ng-primitives/radio';
import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

const meta: Meta<NgpRadioGroupDirective> = {
  title: 'Radio',
  component: NgpRadioGroupDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgpRadioGroupDirective, NgpRadioItemDirective, NgpRadioIndicatorDirective],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
    <div
      ngpRadioGroup
      class="flex flex-col gap-2.5"
      aria-label="View density"
    >
      <div class="flex items-center">
        <button
          ngpRadioItem
          class="flex justify-center items-center bg-white size-6 rounded-full hover:bg-blue-100 cursor-default"
          ngpRadioItemValue="default"
          id="r1"
        >
          <span ngpRadioIndicator class="hidden data-[state=checked]:block rounded-full size-3 bg-blue-400"></span>
        </button>
        <label class="pl-4" for="r1">
          Default
        </label>
      </div>
      <div class="flex items-center">
        <button
          ngpRadioItem
          class="flex justify-center items-center bg-white size-6 rounded-full hover:bg-blue-100 cursor-default"
          ngpRadioItemValue="comfortable"
          id="r2"
        >
          <span ngpRadioIndicator class="hidden data-[state=checked]:block rounded-full size-3 bg-blue-400"></span>
        </button>
        <label class="pl-4" for="r2">
          Comfortable
        </label>
      </div>
      <div class="flex items-center">
        <button
          ngpRadioItem
          class="flex justify-center items-center bg-white size-6 rounded-full hover:bg-blue-100 cursor-default"
          ngpRadioItemValue="compact"
          id="r3"
        >
          <span ngpRadioIndicator class="hidden data-[state=checked]:block rounded-full size-3 bg-blue-400"></span>
        </button>
        <label class="pl-4" for="r3">
          Compact
        </label>
      </div>
    </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<NgpRadioGroupDirective>;

export const Default: Story = {
  args: {},
};
