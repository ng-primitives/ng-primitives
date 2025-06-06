import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Reusable Component - File Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reusable-components/file-upload');
  });

  test('should have no detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['page-has-heading-one'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
