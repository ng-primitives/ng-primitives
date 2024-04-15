import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpRovingFocusGroupDirective } from '../roving-focus-group/roving-focus-group.directive';
import { NgpRovingFocusItemDirective } from '../roving-focus-item/roving-focus-item.directive';

const meta: Meta<NgpRovingFocusGroupDirective> = {
  title: 'Roving Focus',
  component: NgpRovingFocusGroupDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgpRovingFocusGroupDirective, NgpRovingFocusItemDirective],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
     <div ngpRovingFocusGroup class="flex flex-col bg-white rounded-lg divide-neutral-200 divide-y">
      <button ngpRovingFocusItem class="flex flex-col text-start p-4 outline-none focus:ring-2 ring-blue-400 rounded-t-lg focus:z-10">
        <h2 class="text-neutral-900 text-sm font-medium mb-2">Section heading One</h2>
        <p class="text-neutral-600 text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, nulla aut. Tenetur,
          deserunt praesentium aut voluptates obcaecati ea quas incidunt, enim dolore perferendis
          asperiores perspiciatis laudantium id dicta! Distinctio, consequuntur.
        </p>
      </button>
      <button ngpRovingFocusItem class="flex flex-col text-start p-4 outline-none focus:ring-2 ring-blue-400 focus:z-10">
        <h2 class="text-neutral-900 text-sm font-medium mb-2">Section heading Two</h2>
        <p class="text-neutral-600 text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, nulla aut. Tenetur,
          deserunt praesentium aut voluptates obcaecati ea quas incidunt, enim dolore perferendis
          asperiores perspiciatis laudantium id dicta! Distinctio, consequuntur.
        </p>
      </button>
      <button ngpRovingFocusItem class="flex flex-col text-start p-4 outline-none focus:ring-2 ring-blue-400 rounded-b-lg focus:z-10">
        <h2 class="text-neutral-900 text-sm font-medium mb-2">Section heading Three</h2>
        <p class="text-neutral-600 text-sm">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, nulla aut. Tenetur,
          deserunt praesentium aut voluptates obcaecati ea quas incidunt, enim dolore perferendis
          asperiores perspiciatis laudantium id dicta! Distinctio, consequuntur.
        </p>
      </button>
     </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<NgpRovingFocusGroupDirective>;

export const Default: Story = {
  args: {},
};
