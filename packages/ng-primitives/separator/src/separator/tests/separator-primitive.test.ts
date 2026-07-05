import { render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { provideSeparatorConfig } from '../../config/separator-config';
import { NgpSeparator } from '../separator';

describe('NgpSeparator', () => {
  describe('roles & attributes', () => {
    it('should expose role="separator"', async () => {
      const { getByRole } = await render(`<div ngpSeparator></div>`, {
        imports: [NgpSeparator],
      });

      expect(getByRole('separator')).toBeTruthy();
    });

    it('should default to horizontal orientation', async () => {
      const { getByRole } = await render(`<div ngpSeparator></div>`, {
        imports: [NgpSeparator],
      });

      const separator = getByRole('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should reflect a vertical orientation', async () => {
      const { getByRole } = await render(
        `<div ngpSeparator ngpSeparatorOrientation="vertical"></div>`,
        { imports: [NgpSeparator] },
      );

      const separator = getByRole('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });

    it('should reflect an explicit horizontal orientation', async () => {
      const { getByRole } = await render(
        `<div ngpSeparator ngpSeparatorOrientation="horizontal"></div>`,
        { imports: [NgpSeparator] },
      );

      const separator = getByRole('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should support binding the orientation via property syntax', async () => {
      const { getByRole } = await render(
        `<div ngpSeparator [ngpSeparatorOrientation]="'vertical'"></div>`,
        { imports: [NgpSeparator] },
      );

      const separator = getByRole('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('configuration', () => {
    it('should honour a globally provided orientation', async () => {
      const { getByRole } = await render(`<div ngpSeparator></div>`, {
        imports: [NgpSeparator],
        providers: [provideSeparatorConfig({ orientation: 'vertical' })],
      });

      const separator = getByRole('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });

    it('should let an explicit orientation win over the global config', async () => {
      const { getByRole } = await render(
        `<div ngpSeparator ngpSeparatorOrientation="horizontal"></div>`,
        {
          imports: [NgpSeparator],
          providers: [provideSeparatorConfig({ orientation: 'vertical' })],
        },
      );

      const separator = getByRole('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });
  });

  describe('reactive updates', () => {
    it('should update the orientation attributes when the input changes', async () => {
      const { getByRole, fixture, rerender } = await render(
        `<div ngpSeparator [ngpSeparatorOrientation]="orientation"></div>`,
        {
          imports: [NgpSeparator],
          componentProperties: { orientation: 'horizontal' },
        },
      );

      const separator = getByRole('separator');
      expect(separator).toHaveAttribute('aria-orientation', 'horizontal');

      await rerender({ componentProperties: { orientation: 'vertical' } });
      await fixture.whenStable();

      expect(separator).toHaveAttribute('aria-orientation', 'vertical');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });
  });
});
