import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpAvatarFallbackDirective } from '../avatar-fallback/avatar-fallback.directive';
import { NgpAvatarImageDirective } from '../avatar-image/avatar-image.directive';
import { NgpAvatarDirective } from '../avatar/avatar.directive';

const meta: Meta<NgpAvatarDirective> = {
  title: 'Avatar',
  component: NgpAvatarDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgpAvatarDirective, NgpAvatarImageDirective, NgpAvatarFallbackDirective],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
    <div class="flex gap-5">
      <div ngpAvatar class="inline-flex items-center justify-center overflow-hidden select-none w-12 h-12 rounded-full bg-white/5">
          <img ngpAvatarImage class="w-full h-full object-cover rounded-full" src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80" alt="Avatar" />
      </div>

      <div ngpAvatar class="inline-flex items-center justify-center overflow-hidden select-none w-12 h-12 rounded-full bg-white/5">
          <img ngpAvatarImage class="w-full h-full object-cover rounded-full" src="https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&w=128&h=128&dpr=2&q=80" alt="Avatar" />
      </div>

      <div ngpAvatar class="inline-flex items-center justify-center overflow-hidden select-none w-12 h-12 rounded-full bg-white/5">
          <span ngpAvatarFallback class="w-full h-full bg-white flex items-center justify-center text-blue-500 text-base font-medium">PD</span>
      </div>
     </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<NgpAvatarDirective>;

export const Default: Story = {
  args: {},
};
