/* eslint-disable playwright/expect-expect */
import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

test.describe('Accordion', () => {
  async function expectAccordionState(page: Page, expandedIndex: number) {
    for (let i = 1; i <= 3; i++) {
      const isExpanded = i === expandedIndex;
      await expect(page.getByText(`Accordion ${i}`)).toHaveAttribute(
        'aria-expanded',
        isExpanded ? 'true' : 'false',
      );
    }
  }

  async function expectContentState(page: Page, openIndex: number) {
    for (let i = 1; i <= 3; i++) {
      const state = i === openIndex ? 'data-open' : 'data-closed';
      await expect(
        page.getByRole('region').filter({ hasText: `Accordion item ${i}` }),
      ).toHaveAttribute(state);
    }
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('/reusable-components/accordion');
  });

  test('should expand the correct accordion on click', async ({ page }) => {
    // Initially, all accordions are collapsed
    await expectAccordionState(page, -1);
    await expectContentState(page, -1);

    // Click Accordion 1
    await page.getByText('Accordion 1').click();
    await expectAccordionState(page, 1);
    await expectContentState(page, 1);

    // Click Accordion 2
    await page.getByText('Accordion 2').click();
    await expectAccordionState(page, 2);
    await expectContentState(page, 2);

    // Click Accordion 3
    await page.getByText('Accordion 3').click();
    await expectAccordionState(page, 3);
    await expectContentState(page, 3);
  });

  test('should have no detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['page-has-heading-one'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
