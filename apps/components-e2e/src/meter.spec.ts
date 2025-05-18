import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Meter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/meter');
  });

  test('should render the label and value correctly', async ({ page }) => {
    const label = page.getByText('Label');
    const value = page.getByText('40%');

    await expect(label).toBeVisible();
    await expect(value).toBeVisible();
  });

  test('should apply correct ARIA attributes', async ({ page }) => {
    const meter = page.locator('app-meter');

    await expect(meter).toHaveAttribute('role', 'meter');
    await expect(meter).toHaveAttribute('aria-valuenow', '40');
    await expect(meter).toHaveAttribute('aria-valuemin', '0');
    await expect(meter).toHaveAttribute('aria-valuemax', '100');
    await expect(meter).toHaveAttribute('aria-valuetext', /%$/);
  });

  test('should set the indicator width based on value', async ({ page }) => {
    const indicator = page.locator('app-meter [ngpMeterIndicator]');
    await expect(indicator).toHaveAttribute('style', /width: 40%/);
  });

  test('should have no detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['page-has-heading-one'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
