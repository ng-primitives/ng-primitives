import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Reusable Component - Input', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/input');
  });

  test('should have no detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['page-has-heading-one'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
