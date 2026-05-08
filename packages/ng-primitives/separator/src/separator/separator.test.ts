import { render } from '@testing-library/angular';
import { provideSeparatorConfig } from '../config/separator-config';
import { NgpSeparator } from './separator';

describe('NgpSeparator', () => {
  it('should create a default separator', async () => {
    const container = await render(`<div ngpSeparator></div>`, {
      imports: [NgpSeparator],
    });

    expect(container.getByRole('separator')).toBeTruthy();
  });

  it('should set the orientation to horizontal by default', async () => {
    const container = await render(`<div ngpSeparator></div>`, {
      imports: [NgpSeparator],
    });

    const separator = container.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should set the orientation to vertical', async () => {
    const container = await render(
      `<div ngpSeparator [ngpSeparatorOrientation]="'vertical'"></div>`,
      {
        imports: [NgpSeparator],
      },
    );

    const separator = container.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should set the orientation to horizontal', async () => {
    const container = await render(
      `<div ngpSeparator ngpSeparatorOrientation="horizontal"></div>`,
      {
        imports: [NgpSeparator],
      },
    );

    const separator = container.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should allow the global orientation to be set', async () => {
    const container = await render(`<div ngpSeparator></div>`, {
      imports: [NgpSeparator],
      providers: [provideSeparatorConfig({ orientation: 'vertical' })],
    });

    const separator = container.getByRole('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });
});
