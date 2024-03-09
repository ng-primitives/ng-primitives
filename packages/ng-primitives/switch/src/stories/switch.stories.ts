import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpSwitchThumbDirective } from '../switch-thumb/switch-thumb.directive';
import { NgpSwitchDirective } from '../switch/switch.directive';

const meta: Meta<NgpSwitchDirective> = {
  title: 'Switch',
  component: NgpSwitchDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [NgpSwitchDirective, NgpSwitchThumbDirective],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
    <form>
    <div style="display: flex; align-items: center">
      <label for="airplane-mode" style="padding-right: 15px">
        Airplane mode
      </label>
      <button ngpSwitch id="airplane-mode">
        <span ngpSwitchThumb></span>
      </button>
    </div>
  </form>
    `,
    styles: [
      `
[ngpSwitch] {
  all: unset;
  width: 42px;
  height: 25px;
  background-color: rgba(0, 0, 0, 0.4);
  border-radius: 9999px;
  position: relative;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2) 0px 2px 10px;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

[ngpSwitch]:focus {
  box-shadow: 0 0 0 2px black;
}

[ngpSwitch][data-state='checked'] {
  background-color: black;
}

[ngpSwitchThumb] {
  display: block;
  width: 21px;
  height: 21px;
  background-color: white;
  border-radius: 9999px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 2px;
  transition: transform 100ms;
  transform: translateX(2px);
  will-change: transform;
}

[ngpSwitchThumb][data-state='checked'] {
  transform: translateX(19px);
}

label {
  color: white;
  font-size: 15px;
  line-height: 1;
}
      `,
    ],
  }),
};

export default meta;
type Story = StoryObj<NgpSwitchDirective>;

export const Default: Story = {
  args: {},
};
