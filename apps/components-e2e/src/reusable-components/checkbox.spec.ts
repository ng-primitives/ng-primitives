import { expect, test } from '@playwright/test';

test.describe('Reusable Component - Checkbox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reusable-components/checkbox');
  });

  test('should be rendered with correct attributes', async ({ page }) => {
    const checkbox = page.getByRole('checkbox');
    await expect(checkbox).toBeVisible();
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
    await expect(checkbox).not.toHaveAttribute('aria-disabled');
  });

  test('should toggle aria-checked on click', async ({ page }) => {
    const checkbox = page.getByRole('checkbox');

    await checkbox.click();
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');

    await checkbox.click();
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  test('should toggle aria-checked on spacebar press', async ({ page }) => {
    const checkbox = page.getByRole('checkbox');

    await checkbox.focus();

    await page.keyboard.press('Space');
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');

    await page.keyboard.press('Space');
    await expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  test('should be focusable via Tab', async ({ page }) => {
    const checkbox = page.getByRole('checkbox');
    await expect(checkbox).toHaveAttribute('tabindex', '0');
  });

  test('should have correct accessible role and state', async ({ page }) => {
    const checkbox = page.getByRole('checkbox');
    await expect(checkbox).toHaveAttribute('role', 'checkbox');

    const ariaChecked = await checkbox.getAttribute('aria-checked');
    expect(['true', 'false']).toContain(ariaChecked);
  });
});
