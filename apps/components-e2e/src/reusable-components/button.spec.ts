import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Reusable Component - Button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reusable-components/button');
  });

  test('should add the data-hover attribute on hover', async ({ page }) => {
    const button = page.getByRole('button');

    // Check that the button does not have the data-hover attribute initially
    await expect(button).not.toHaveAttribute('data-hover');

    // Hover over the button
    await button.hover();

    // Check that the button now has the data-hover attribute
    await expect(button).toHaveAttribute('data-hover');
  });

  test('should add the data-focus-visible attribute on focus via the kayboard', async ({
    page,
  }) => {
    const button = page.getByRole('button');

    // Check that the button does not have the data-focus-visible attribute initially
    await expect(button).not.toHaveAttribute('data-focus-visible');

    // Focus the button by tabbing to it
    await button.focus();
    await page.keyboard.press('Tab');
    // shift + tab to focus the button
    await page.keyboard.press('Shift+Tab');

    // Check that the button now has the data-focus-visible attribute
    await expect(button).toHaveAttribute('data-focus-visible');

    // Blur the button
    await button.blur();

    // Check that the button no longer has the data-focus-visible attribute
    await expect(button).not.toHaveAttribute('data-focus-visible');
  });

  test('should add the data-press attribute on pressed', async ({ page }) => {
    const button = page.getByRole('button');
    // Check that the button does not have the data-press attribute initially
    await expect(button).not.toHaveAttribute('data-press');
    // Press the button
    await button.dispatchEvent('pointerdown');
    // Check that the button now has the data-press attribute
    await expect(button).toHaveAttribute('data-press');

    // Release the button
    await button.dispatchEvent('pointerup');
    // Check that the button no longer has the data-press attribute
    await expect(button).not.toHaveAttribute('data-press');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/reusable-components/accordion');
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['page-has-heading-one'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
