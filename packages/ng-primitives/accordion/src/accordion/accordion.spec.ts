/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { fireEvent, render } from '@testing-library/angular';
import { NgpAccordionContent } from '../accordion-content/accordion-content';
import { NgpAccordionItem } from '../accordion-item/accordion-item';
import { NgpAccordionTrigger } from '../accordion-trigger/accordion-trigger';
import { NgpAccordion } from './accordion';

describe('NgpAccordion', () => {
  it('should set the orientation to vertical', async () => {
    const fixture = await renderTemplate({ orientation: 'vertical' });
    const accordion = fixture.getByTestId('accordion');
    expect(accordion.getAttribute('data-orientation')).toBe('vertical');

    // the items, triggers, and content should all be vertical
    const items = fixture.getAllByTestId('accordion-item');
    const triggers = fixture.getAllByTestId('accordion-trigger');
    const content = fixture.getAllByTestId('accordion-content');

    for (let i = 0; i < items.length; i++) {
      expect(items[i].getAttribute('data-orientation')).toBe('vertical');
      expect(triggers[i].getAttribute('data-orientation')).toBe('vertical');
      expect(content[i].getAttribute('data-orientation')).toBe('vertical');
    }
  });

  it('should set the orientation to horizontal', async () => {
    const fixture = await renderTemplate({ orientation: 'horizontal' });
    const accordion = fixture.getByTestId('accordion');
    expect(accordion.getAttribute('data-orientation')).toBe('horizontal');

    // the items, triggers, and content should all be horizontal
    const items = fixture.getAllByTestId('accordion-item');
    const triggers = fixture.getAllByTestId('accordion-trigger');
    const content = fixture.getAllByTestId('accordion-content');

    for (let i = 0; i < items.length; i++) {
      expect(items[i].getAttribute('data-orientation')).toBe('horizontal');
      expect(triggers[i].getAttribute('data-orientation')).toBe('horizontal');
      expect(content[i].getAttribute('data-orientation')).toBe('horizontal');
    }
  });

  it('should have collapsed panels by default', async () => {
    const fixture = await renderTemplate();
    const triggers = fixture.getAllByTestId('accordion-trigger');

    for (const trigger of triggers) {
      expect(trigger.getAttribute('data-open')).toBe('false');
    }
  });

  it('should expand the panel when a value is set', async () => {
    const fixture = await renderTemplate({ value: 'item-1' });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    expect(triggers[0].getAttribute('data-open')).toBe('true');
    expect(triggers[1].getAttribute('data-open')).toBe('false');
  });

  it('should toggle the item when a trigger is clicked', async () => {
    const valueChange = jest.fn();
    const fixture = await renderTemplate({ valueChange });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    fireEvent.click(triggers[1]);
    expect(triggers[0].getAttribute('data-open')).toBe('false');
    expect(triggers[1].getAttribute('data-open')).toBe('true');

    expect(valueChange).toHaveBeenCalledWith('item-2');
  });

  it('should not toggle the item when the item is disabled', async () => {
    const valueChange = jest.fn();
    const fixture = await renderTemplate({ itemDisabled: true, valueChange });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    fireEvent.click(triggers[0]);
    expect(triggers[0].getAttribute('data-open')).toBe('false');
    expect(triggers[1].getAttribute('data-open')).toBe('false');

    expect(valueChange).not.toHaveBeenCalled();
  });

  it('should not toggle the item when the accordion is disabled', async () => {
    const valueChange = jest.fn();
    const fixture = await renderTemplate({ accordionDisabled: true, valueChange });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    fireEvent.click(triggers[0]);
    expect(triggers[0].getAttribute('data-open')).toBe('false');
    expect(triggers[1].getAttribute('data-open')).toBe('false');

    expect(valueChange).not.toHaveBeenCalled();
  });

  it('should collapse the panel when the trigger is clicked again', async () => {
    const fixture = await renderTemplate({ value: 'item-1' });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    fireEvent.click(triggers[0]);
    expect(triggers[0].getAttribute('data-open')).toBe('false');
  });

  it('should not collapse the panel when the trigger is clicked again and the accordion is not collapsible', async () => {
    const fixture = await renderTemplate({ value: 'item-1', collapsible: false });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    fireEvent.click(triggers[0]);
    expect(triggers[0].getAttribute('data-open')).toBe('true');
  });

  it('should expand multiple items when the type is multiple', async () => {
    const fixture = await renderTemplate({ type: 'multiple', value: ['item-1', 'item-2'] });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    expect(triggers[0].getAttribute('data-open')).toBe('true');
    expect(triggers[1].getAttribute('data-open')).toBe('true');
  });

  it('should collapse multiple items when the type is multiple', async () => {
    const fixture = await renderTemplate({ type: 'multiple', value: ['item-1', 'item-2'] });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    fireEvent.click(triggers[0]);
    fireEvent.click(triggers[1]);

    expect(triggers[0].getAttribute('data-open')).toBe('false');
    expect(triggers[1].getAttribute('data-open')).toBe('false');
  });

  it('should set a unique id for each trigger', async () => {
    const fixture = await renderTemplate();
    const triggers = fixture.getAllByTestId('accordion-trigger');

    const ids = triggers.map(trigger => trigger.getAttribute('id'));
    expect(new Set(ids).size).toBe(triggers.length);
  });

  it('should set the data-open attributes on the trigger elements', async () => {
    const fixture = await renderTemplate({ value: 'item-1' });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    expect(triggers[0].getAttribute('data-open')).toBe('true');
    expect(triggers[1].getAttribute('data-open')).toBe('false');
  });

  it('should set the data-open attributes on the item elements', async () => {
    const fixture = await renderTemplate({ value: 'item-1' });
    const items = fixture.getAllByTestId('accordion-item');

    expect(items[0].getAttribute('data-open')).toBe('true');
    expect(items[1].getAttribute('data-open')).toBe('false');
  });

  it('should set the data-open attributes on the content elements', async () => {
    const fixture = await renderTemplate({ value: 'item-1' });
    const content = fixture.getAllByTestId('accordion-content');

    expect(content[0].getAttribute('data-open')).toBe('true');
    expect(content[1].getAttribute('data-open')).toBe('false');
  });

  it('should set the data-disabled attribute on the trigger elements', async () => {
    const fixture = await renderTemplate({ itemDisabled: true });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    expect(triggers[0].getAttribute('data-disabled')).toBe('true');
    expect(triggers[1].getAttribute('data-disabled')).toBe('false');
  });

  it('should set the data-disabled attribute on the item elements', async () => {
    const fixture = await renderTemplate({ itemDisabled: true });
    const items = fixture.getAllByTestId('accordion-item');

    expect(items[0].getAttribute('data-disabled')).toBe('true');
    expect(items[1].getAttribute('data-disabled')).toBe('false');
  });

  it('should set a unique id for each content element', async () => {
    const fixture = await renderTemplate();
    const content = fixture.getAllByTestId('accordion-content');

    const ids = content.map(trigger => trigger.getAttribute('id'));
    expect(new Set(ids).size).toBe(content.length);
  });

  it('should set the aria-labelledby attribute on the content elements', async () => {
    const fixture = await renderTemplate();
    const triggers = fixture.getAllByTestId('accordion-trigger');
    const content = fixture.getAllByTestId('accordion-content');

    expect(content[0].getAttribute('aria-labelledby')).toBe(triggers[0].getAttribute('id'));
    expect(content[1].getAttribute('aria-labelledby')).toBe(triggers[1].getAttribute('id'));
  });

  it('should set the aria-controls attribute on the trigger elements', async () => {
    const fixture = await renderTemplate();
    const triggers = fixture.getAllByTestId('accordion-trigger');
    const content = fixture.getAllByTestId('accordion-content');

    expect(triggers[0].getAttribute('aria-controls')).toBe(content[0].getAttribute('id'));
    expect(triggers[1].getAttribute('aria-controls')).toBe(content[1].getAttribute('id'));
  });

  it('should set the aria-expanded attribute on the trigger elements', async () => {
    const fixture = await renderTemplate({ value: 'item-1' });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(triggers[1].getAttribute('aria-expanded')).toBe('false');
  });

  /**
   *
   */
  function renderTemplate(componentProperties?: { [alias: string]: unknown }) {
    return render(
      `
    <div data-testid="accordion"
         ngpAccordion
         [ngpAccordionType]="type"
         [ngpAccordionOrientation]="orientation"
         [ngpAccordionCollapsible]="collapsible"
         [ngpAccordionDisabled]="accordionDisabled"
         [ngpAccordionValue]="value"
         (ngpAccordionValueChange)="valueChange($event)">

      <div data-testid="accordion-item"
           ngpAccordionItem
           ngpAccordionItemValue="item-1"
           [ngpAccordionItemDisabled]="itemDisabled">

        <button data-testid="accordion-trigger" ngpAccordionTrigger>Header 1</button>
        <div data-testid="accordion-content" ngpAccordionContent>Content 1</div>
      </div>

      <div data-testid="accordion-item" ngpAccordionItem ngpAccordionItemValue="item-2">
        <button data-testid="accordion-trigger" ngpAccordionTrigger>Header 2</button>
        <div data-testid="accordion-content" ngpAccordionContent>Content 2</div>
      </div>

    </div>
      `,
      {
        imports: [NgpAccordion, NgpAccordionItem, NgpAccordionContent, NgpAccordionTrigger],
        componentProperties: {
          type: 'single',
          collapsible: true,
          orientation: 'vertical',
          valueChange: jest.fn(),
          ...componentProperties,
        },
      },
    );
  }
});
