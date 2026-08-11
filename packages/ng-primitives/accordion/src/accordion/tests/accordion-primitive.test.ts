import { fireEvent, render, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  NgpAccordion,
  NgpAccordionContent,
  NgpAccordionItem,
  NgpAccordionTrigger,
} from 'ng-primitives/accordion';
import { describe, expect, it, vi } from 'vitest';

const imports = [NgpAccordion, NgpAccordionItem, NgpAccordionContent, NgpAccordionTrigger];

function renderTemplate(componentProperties?: { [alias: string]: unknown }) {
  return render(
    `
    <div data-testid="accordion"
         ngpAccordion
         [ngpAccordionType]="type"
         [ngpAccordionOrientation]="orientation"
         [ngpAccordionCollapsible]="collapsible"
         [ngpAccordionDisabled]="accordionDisabled"
         [(ngpAccordionValue)]="value"
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
      imports,
      componentProperties: {
        type: 'single',
        collapsible: true,
        orientation: 'vertical',
        valueChange: vi.fn(),
        ...componentProperties,
      },
    },
  );
}

describe('NgpAccordion', () => {
  it('should set the orientation to vertical', async () => {
    const fixture = await renderTemplate({ orientation: 'vertical' });
    expect(fixture.getByTestId('accordion')).toHaveAttribute('data-orientation', 'vertical');

    const items = fixture.getAllByTestId('accordion-item');
    const triggers = fixture.getAllByTestId('accordion-trigger');
    const content = fixture.getAllByTestId('accordion-content');

    for (let i = 0; i < items.length; i++) {
      expect(items[i]).toHaveAttribute('data-orientation', 'vertical');
      expect(triggers[i]).toHaveAttribute('data-orientation', 'vertical');
      expect(content[i]).toHaveAttribute('data-orientation', 'vertical');
    }
  });

  it('should set the orientation to horizontal', async () => {
    const fixture = await renderTemplate({ orientation: 'horizontal' });
    expect(fixture.getByTestId('accordion')).toHaveAttribute('data-orientation', 'horizontal');

    const items = fixture.getAllByTestId('accordion-item');
    const triggers = fixture.getAllByTestId('accordion-trigger');
    const content = fixture.getAllByTestId('accordion-content');

    for (let i = 0; i < items.length; i++) {
      expect(items[i]).toHaveAttribute('data-orientation', 'horizontal');
      expect(triggers[i]).toHaveAttribute('data-orientation', 'horizontal');
      expect(content[i]).toHaveAttribute('data-orientation', 'horizontal');
    }
  });

  it('should have collapsed panels by default', async () => {
    const fixture = await renderTemplate();
    const triggers = fixture.getAllByTestId('accordion-trigger');

    for (const trigger of triggers) {
      expect(trigger).not.toHaveAttribute('data-open');
    }
  });

  it('should expand the panel when a value is set', async () => {
    const fixture = await renderTemplate({ value: 'item-1' });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    expect(triggers[0]).toHaveAttribute('data-open');
    expect(triggers[1]).not.toHaveAttribute('data-open');
  });

  it('should toggle the item when a trigger is clicked', async () => {
    const valueChange = vi.fn();
    const fixture = await render(
      `
      <div data-testid="accordion" ngpAccordion [(ngpAccordionValue)]="value" (ngpAccordionValueChange)="valueChange($event)">
        <div data-testid="accordion-item" ngpAccordionItem ngpAccordionItemValue="item-1">
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
        imports,
        componentProperties: { value: 'item-1', valueChange },
      },
    );
    const triggers = fixture.getAllByTestId('accordion-trigger');

    fireEvent.click(triggers[1]);
    fixture.detectChanges();
    expect(triggers[0]).not.toHaveAttribute('data-open');
    expect(triggers[1]).toHaveAttribute('data-open');
    expect(valueChange).toHaveBeenCalledWith('item-2');
  });

  it('should not toggle the item when the item is disabled', async () => {
    const valueChange = vi.fn();
    const fixture = await renderTemplate({ itemDisabled: true, valueChange });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    fireEvent.click(triggers[0]);
    expect(triggers[0]).not.toHaveAttribute('data-open');
    expect(triggers[1]).not.toHaveAttribute('data-open');
    expect(valueChange).not.toHaveBeenCalled();
  });

  it('should not toggle the item when the accordion is disabled', async () => {
    const valueChange = vi.fn();
    const fixture = await renderTemplate({ accordionDisabled: true, valueChange });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    fireEvent.click(triggers[0]);
    expect(triggers[0]).not.toHaveAttribute('data-open');
    expect(triggers[1]).not.toHaveAttribute('data-open');
    expect(valueChange).not.toHaveBeenCalled();
  });

  it('should collapse the panel when the trigger is clicked again', async () => {
    const fixture = await renderTemplate({ value: 'item-1' });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    fireEvent.click(triggers[0]);
    expect(triggers[0]).not.toHaveAttribute('data-open');
  });

  it('should not collapse the panel when the trigger is clicked again and the accordion is not collapsible', async () => {
    const fixture = await renderTemplate({ value: 'item-1', collapsible: false });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    fireEvent.click(triggers[0]);
    expect(triggers[0]).toHaveAttribute('data-open');
  });

  it('should expand multiple items when the type is multiple', async () => {
    const fixture = await renderTemplate({ type: 'multiple', value: ['item-1', 'item-2'] });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    expect(triggers[0]).toHaveAttribute('data-open');
    expect(triggers[1]).toHaveAttribute('data-open');
  });

  it('should collapse multiple items when the type is multiple', async () => {
    const fixture = await renderTemplate({ type: 'multiple', value: ['item-1', 'item-2'] });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    fireEvent.click(triggers[0]);
    fireEvent.click(triggers[1]);

    expect(triggers[0]).not.toHaveAttribute('data-open');
    expect(triggers[1]).not.toHaveAttribute('data-open');
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

    expect(triggers[0]).toHaveAttribute('data-open');
    expect(triggers[1]).not.toHaveAttribute('data-open');
  });

  it('should set the data-open attributes on the item elements', async () => {
    const fixture = await renderTemplate({ value: 'item-1' });
    const items = fixture.getAllByTestId('accordion-item');

    expect(items[0]).toHaveAttribute('data-open');
    expect(items[1]).not.toHaveAttribute('data-open');
  });

  it('should set the data-open attributes on the content elements', async () => {
    const fixture = await renderTemplate({ value: 'item-1' });
    const content = fixture.getAllByTestId('accordion-content');

    expect(content[0]).toHaveAttribute('data-open');
    expect(content[1]).not.toHaveAttribute('data-open');
  });

  it('should set the data-disabled attribute on the trigger elements', async () => {
    const fixture = await renderTemplate({ itemDisabled: true });
    const triggers = fixture.getAllByTestId('accordion-trigger');

    expect(triggers[0]).toHaveAttribute('data-disabled');
    expect(triggers[1]).not.toHaveAttribute('data-disabled');
  });

  it('should set the data-disabled attribute on the item elements', async () => {
    const fixture = await renderTemplate({ itemDisabled: true });
    const items = fixture.getAllByTestId('accordion-item');

    expect(items[0]).toHaveAttribute('data-disabled');
    expect(items[1]).not.toHaveAttribute('data-disabled');
  });

  it('should set a unique id for each content element', async () => {
    const fixture = await renderTemplate();
    const content = fixture.getAllByTestId('accordion-content');

    const ids = content.map(c => c.getAttribute('id'));
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

    expect(triggers[0]).toHaveAttribute('aria-expanded', 'true');
    expect(triggers[1]).toHaveAttribute('aria-expanded', 'false');
  });

  describe('data-enter and data-exit attributes', () => {
    it('should not set data-enter or data-exit on initial render', async () => {
      const fixture = await renderTemplate({ value: 'item-1' });
      const content = fixture.getAllByTestId('accordion-content');

      expect(content[0]).not.toHaveAttribute('data-enter');
      expect(content[0]).not.toHaveAttribute('data-exit');
      expect(content[1]).not.toHaveAttribute('data-enter');
      expect(content[1]).not.toHaveAttribute('data-exit');
    });

    it('should set data-enter when item opens via user interaction', async () => {
      const fixture = await renderTemplate();
      const triggers = fixture.getAllByTestId('accordion-trigger');
      const content = fixture.getAllByTestId('accordion-content');

      fireEvent.click(triggers[0]);
      fixture.detectChanges();
      fixture.detectChanges();

      await waitFor(() => expect(content[0]).toHaveAttribute('data-enter'));
      expect(content[0]).not.toHaveAttribute('data-exit');
    });

    it('should set data-exit when item closes via user interaction', async () => {
      const fixture = await renderTemplate({ value: 'item-1' });
      const triggers = fixture.getAllByTestId('accordion-trigger');
      const content = fixture.getAllByTestId('accordion-content');

      fireEvent.click(triggers[0]);
      fixture.detectChanges();
      fixture.detectChanges();

      await waitFor(() => expect(content[0]).toHaveAttribute('data-exit'));
      expect(content[0]).not.toHaveAttribute('data-enter');
    });
  });

  describe('content height CSS variable', () => {
    it('should set --ngp-accordion-content-height when item is open', async () => {
      const fixture = await renderTemplate({ value: 'item-1' });
      const content = fixture.getAllByTestId('accordion-content');

      await waitFor(() => {
        expect(content[0].style.getPropertyValue('--ngp-accordion-content-height')).not.toBe('');
        expect(content[0].style.getPropertyValue('--ngp-accordion-content-height')).not.toBe('0px');
      });
    });

    it('should not set --ngp-accordion-content-height for closed items', async () => {
      const fixture = await renderTemplate({ value: 'item-1' });
      const content = fixture.getAllByTestId('accordion-content');

      expect(content[1].style.getPropertyValue('--ngp-accordion-content-height')).toBe('');
    });

    it('should not set --ngp-accordion-content-height when item is in a hidden container', async () => {
      const fixture = await render(
        `
        <div data-testid="hidden-container" style="display:none">
          <div ngpAccordion ngpAccordionType="single" ngpAccordionCollapsible ngpAccordionValue="item-1">
            <div ngpAccordionItem ngpAccordionItemValue="item-1">
              <button ngpAccordionTrigger>Header 1</button>
              <div data-testid="accordion-content" ngpAccordionContent>Content 1</div>
            </div>
          </div>
        </div>
        `,
        { imports },
      );
      const content = fixture.getAllByTestId('accordion-content');

      expect(content[0].style.getPropertyValue('--ngp-accordion-content-height')).toBe('');
    });
  });

  describe('content width CSS variable', () => {
    it('should set --ngp-accordion-content-width when item is open', async () => {
      const fixture = await renderTemplate({ orientation: 'horizontal', value: 'item-1' });
      const content = fixture.getAllByTestId('accordion-content');

      await waitFor(() => {
        expect(content[0].style.getPropertyValue('--ngp-accordion-content-width')).not.toBe('');
        expect(content[0].style.getPropertyValue('--ngp-accordion-content-width')).not.toBe('0px');
      });
    });

    it('should not set --ngp-accordion-content-width for closed items', async () => {
      const fixture = await renderTemplate({ orientation: 'horizontal', value: 'item-1' });
      const content = fixture.getAllByTestId('accordion-content');

      expect(content[1].style.getPropertyValue('--ngp-accordion-content-width')).toBe('');
    });
  });

  describe('keyboard interaction', () => {
    it('should toggle the item when Enter is pressed on a focused trigger', async () => {
      const valueChange = vi.fn();
      const fixture = await renderTemplate({ valueChange });
      const triggers = fixture.getAllByTestId('accordion-trigger');

      triggers[0].focus();
      await userEvent.keyboard('{Enter}');

      expect(valueChange).toHaveBeenCalledWith('item-1');
      expect(triggers[0]).toHaveAttribute('data-open');
    });

    it('should toggle the item when Space is pressed on a focused trigger', async () => {
      const valueChange = vi.fn();
      const fixture = await renderTemplate({ valueChange });
      const triggers = fixture.getAllByTestId('accordion-trigger');

      triggers[0].focus();
      await userEvent.keyboard(' ');

      expect(valueChange).toHaveBeenCalledWith('item-1');
      expect(triggers[0]).toHaveAttribute('data-open');
    });
  });

  describe('find-in-page (hidden until-found + beforematch)', () => {
    it('should mark a collapsed panel as hidden="until-found"', async () => {
      const fixture = await render(
        `
        <style>[ngpAccordionContent]:not([data-open]) { height: 0; padding: 0; border: 0; overflow: hidden; }</style>
        <div ngpAccordion ngpAccordionType="single" ngpAccordionValue="item-1">
          <div ngpAccordionItem ngpAccordionItemValue="item-1">
            <button ngpAccordionTrigger>Header 1</button>
            <div data-testid="content-1" ngpAccordionContent>Content 1</div>
          </div>
          <div ngpAccordionItem ngpAccordionItemValue="item-2">
            <button ngpAccordionTrigger>Header 2</button>
            <div data-testid="content-2" ngpAccordionContent>Content 2</div>
          </div>
        </div>
        `,
        { imports },
      );

      // The closed panel collapses to zero height and becomes discoverable by find-in-page.
      await waitFor(() =>
        expect(fixture.getByTestId('content-2')).toHaveAttribute('hidden', 'until-found'),
      );
      // The open panel is not hidden.
      expect(fixture.getByTestId('content-1')).not.toHaveAttribute('hidden');
    });

    it('should open the item when the browser fires beforematch on its content', async () => {
      const valueChange = vi.fn();
      const fixture = await renderTemplate({ valueChange });
      const content = fixture.getAllByTestId('accordion-content');
      const triggers = fixture.getAllByTestId('accordion-trigger');

      content[0].dispatchEvent(new Event('beforematch'));
      fixture.detectChanges();

      expect(valueChange).toHaveBeenCalledWith('item-1');
      expect(triggers[0]).toHaveAttribute('data-open');
    });

    it('should not open a disabled item on beforematch', async () => {
      const valueChange = vi.fn();
      const fixture = await renderTemplate({ itemDisabled: true, valueChange });
      const content = fixture.getAllByTestId('accordion-content');

      content[0].dispatchEvent(new Event('beforematch'));
      fixture.detectChanges();

      expect(valueChange).not.toHaveBeenCalled();
    });

    it('should not open an item on beforematch when the accordion is disabled', async () => {
      const valueChange = vi.fn();
      const fixture = await renderTemplate({ accordionDisabled: true, valueChange });
      const content = fixture.getAllByTestId('accordion-content');

      content[0].dispatchEvent(new Event('beforematch'));
      fixture.detectChanges();

      expect(valueChange).not.toHaveBeenCalled();
    });
  });

  describe('content role', () => {
    it('should set role="region" on the content elements', async () => {
      const fixture = await renderTemplate();
      const content = fixture.getAllByTestId('accordion-content');

      for (const c of content) {
        expect(c).toHaveAttribute('role', 'region');
      }
    });
  });

  describe('controlled and uncontrolled value', () => {
    it('should round-trip a two-way [(ngpAccordionValue)] binding on click', async () => {
      const fixture = await render(
        `<div ngpAccordion ngpAccordionType="single" ngpAccordionCollapsible [(ngpAccordionValue)]="value">
          <div ngpAccordionItem ngpAccordionItemValue="item-1">
            <button data-testid="trigger-1" ngpAccordionTrigger>Header 1</button>
            <div ngpAccordionContent>Content 1</div>
          </div>
        </div>`,
        { imports, componentProperties: { value: null } },
      );

      const trigger = fixture.getByTestId('trigger-1');

      fireEvent.click(trigger);
      fixture.detectChanges();
      expect(fixture.fixture.componentInstance.value).toBe('item-1');

      fireEvent.click(trigger);
      fixture.detectChanges();
      expect(fixture.fixture.componentInstance.value).toBeNull();
    });

    it('should open and close on click when value is uncontrolled', async () => {
      const fixture = await render(
        `<div ngpAccordion ngpAccordionType="single" ngpAccordionCollapsible>
          <div ngpAccordionItem ngpAccordionItemValue="item-1">
            <button data-testid="trigger-1" ngpAccordionTrigger>Header 1</button>
            <div ngpAccordionContent>Content 1</div>
          </div>
        </div>`,
        { imports },
      );

      const trigger = fixture.getByTestId('trigger-1');

      fireEvent.click(trigger);
      expect(trigger).toHaveAttribute('data-open');

      fireEvent.click(trigger);
      expect(trigger).not.toHaveAttribute('data-open');
    });
  });
});
