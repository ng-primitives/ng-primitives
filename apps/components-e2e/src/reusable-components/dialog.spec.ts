import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Reusable Component - Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reusable-components/dialog');
  });

  test('should remain open when a drag starts inside the dialog and ends on the overlay', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Open Dialog' }).click();

    const overlay = page.locator('app-dialog');
    const dialog = page.locator('[ngpDialog]');
    const bodyText = page.getByText(
      'This is a dialog. It can be used to display information or to ask for confirmation.',
    );

    await expect(overlay).toBeVisible();
    await expect(dialog).toBeVisible();

    const textBox = await bodyText.boundingBox();
    const overlayBox = await overlay.boundingBox();
    const dialogBox = await dialog.boundingBox();

    expect(textBox).not.toBeNull();
    expect(overlayBox).not.toBeNull();
    expect(dialogBox).not.toBeNull();

    const startX = textBox!.x + textBox!.width / 2;
    const startY = textBox!.y + textBox!.height / 2;
    const endX = overlayBox!.x + 24;
    const endY = dialogBox!.y + dialogBox!.height + 24;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 12 });
    await page.mouse.up();

    await expect(dialog).toBeVisible();
  });

  test('should have no detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['page-has-heading-one'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
