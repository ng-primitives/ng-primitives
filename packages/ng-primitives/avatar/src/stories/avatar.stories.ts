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
     <div ngpAvatar>
        <img ngpAvatarImage src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80" alt="Avatar" />
     </div>

     <div ngpAvatar>
        <img ngpAvatarImage src="https://images.unsplash.com/photo-1511485977113-f34c92461ad9?ixlib=rb-1.2.1&w=128&h=128&dpr=2&q=80" alt="Avatar" />
     </div>

     <div ngpAvatar>
        <span ngpAvatarFallback>PD</span>
     </div>
    `,
    styles: [
      `
      :host {
        display: flex;
        gap: 20px;
      }

      [ngpAvatar] {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        vertical-align: middle;
        overflow: hidden;
        user-select: none;
        width: 45px;
        height: 45px;
        border-radius: 100%;
        background-color: rgba(0, 0, 0, 0.05);
      }

      [ngpAvatarImage] {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: inherit;
      }

      [ngpAvatarFallback] {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: white;
        color: rgb(101, 80, 185);
        font-size: 15px;
        line-height: 1;
        font-weight: 500;
      }
    `,
    ],
  }),
};

export default meta;
type Story = StoryObj<NgpAvatarDirective>;

export const Default: Story = {
  args: {},
};
