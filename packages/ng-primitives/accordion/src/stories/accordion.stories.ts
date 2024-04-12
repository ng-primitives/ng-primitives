import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { NgpAccordionContentDirective } from '../accordion-content/accordion-content.directive';
import { NgpAccordionItemDirective } from '../accordion-item/accordion-item.directive';
import { NgpAccordionTriggerDirective } from '../accordion-trigger/accordion-trigger.directive';
import { NgpAccordionDirective } from '../accordion/accordion.directive';

const meta: Meta<NgpAccordionDirective<string>> = {
  title: 'Accordion',
  component: NgpAccordionDirective,
  argTypes: {},
  decorators: [
    moduleMetadata({
      imports: [
        NgpAccordionDirective,
        NgpAccordionItemDirective,
        NgpAccordionTriggerDirective,
        NgpAccordionContentDirective,
      ],
    }),
  ],
  render: ({ ...args }) => ({
    props: args,
    template: `
     <div ngpAccordion ngpAccordionType="single" ngpAccordionCollapsible>
        <div ngpAccordionItem ngpAccordionItemValue="item-1">
          <div ngpAccordionTrigger>Is it accessible?</div>
          <div ngpAccordionContent>
            Yes. It adheres to the WAI-ARIA design pattern.
          </div>
        </div>

        <div ngpAccordionItem ngpAccordionItemValue="item-2">
          <div ngpAccordionTrigger>Is it unstyled?</div>
          <div ngpAccordionContent>
            Yes. It's unstyled by default, giving you freedom over the look and feel.
          </div>
        </div>

        <div ngpAccordionItem ngpAccordionItemValue="item-3">
          <div ngpAccordionTrigger>Can it be animated?</div>
          <div ngpAccordionContent>
            Yes! You can animate the Accordion with CSS or JavaScript.
          </div>
        </div>
     </div>
    `,
  }),
};

export default meta;
type Story = StoryObj<NgpAccordionDirective<string>>;

export const Default: Story = {
  args: {},
};
