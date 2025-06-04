import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Reusable Component - Date Picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/date-picker');
  });

  test('should have no detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules([
        'page-has-heading-one',
        // we should probably enable this rule in the future
        'color-contrast',
      ])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
