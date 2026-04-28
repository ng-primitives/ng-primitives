import { fireEvent, render } from '@testing-library/angular';
import { AccordionFixture, AccordionItemFixture } from './accordion-forms.fixture';

async function renderAccordion(collapsible = true) {
  return render(
    `<app-accordion type="single" collapsible="${collapsible}">
      <app-accordion-item value="item-1" heading="Accordion 1">Content 1</app-accordion-item>
      <app-accordion-item value="item-2" heading="Accordion 2">Content 2</app-accordion-item>
      <app-accordion-item value="item-3" heading="Accordion 3">Content 3</app-accordion-item>
    </app-accordion>`,
    { imports: [AccordionFixture, AccordionItemFixture] },
  );
}

describe('Accordion (reusable component) — standalone', () => {
  it('renders with all items collapsed initially', async () => {
    const { getAllByRole } = await renderAccordion();
    for (const button of getAllByRole('button')) {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  });

  it('expands an item on click', async () => {
    const { getAllByRole } = await renderAccordion();
    const [trigger1] = getAllByRole('button');
    fireEvent.click(trigger1);
    expect(trigger1).toHaveAttribute('aria-expanded', 'true');
  });

  it('collapses the active item when another is expanded (single type)', async () => {
    const { getAllByRole } = await renderAccordion();
    const [trigger1, trigger2] = getAllByRole('button');
    fireEvent.click(trigger1);
    fireEvent.click(trigger2);
    expect(trigger1).toHaveAttribute('aria-expanded', 'false');
    expect(trigger2).toHaveAttribute('aria-expanded', 'true');
  });

  it('collapses an item on a second click in collapsible mode', async () => {
    const { getAllByRole } = await renderAccordion();
    const [trigger1] = getAllByRole('button');
    fireEvent.click(trigger1);
    expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(trigger1);
    expect(trigger1).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not collapse an item on a second click when not collapsible', async () => {
    const { getAllByRole } = await renderAccordion(false);
    const [trigger1] = getAllByRole('button');
    fireEvent.click(trigger1);
    expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(trigger1);
    expect(trigger1).toHaveAttribute('aria-expanded', 'true');
  });
});
