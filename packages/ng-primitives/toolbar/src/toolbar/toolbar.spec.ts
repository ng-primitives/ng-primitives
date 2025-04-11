import { render } from '@testing-library/angular';
import { NgpToolbar } from './toolbar';

describe('NgpToolbar', () => {
  it('should add the toolbar role', async () => {
    const container = await render(`<div ngpToolbar></div>`, {
      imports: [NgpToolbar],
    });

    const toolbar = container.getByRole('toolbar');
    expect(toolbar).toBeTruthy();
  });

  it('should set the orientation attribute', async () => {
    const container = await render(`<div ngpToolbar></div>`, {
      imports: [NgpToolbar],
    });

    const toolbar = container.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('data-orientation', 'horizontal');
    expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('should set the orientation attribute to vertical', async () => {
    const container = await render(`<div ngpToolbar ngpToolbarOrientation="vertical"></div>`, {
      imports: [NgpToolbar],
    });

    const toolbar = container.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('data-orientation', 'vertical');
    expect(toolbar).toHaveAttribute('aria-orientation', 'vertical');
  });
});
