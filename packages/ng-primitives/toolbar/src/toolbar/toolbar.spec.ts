import { render } from '@testing-library/angular';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
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

  it('should navigate between items with ArrowRight in horizontal mode', async () => {
    const { getByTestId, fixture } = await render(
      `
      <div ngpToolbar>
        <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
        <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
        <button data-testid="item3" ngpRovingFocusItem>Item 3</button>
      </div>
    `,
      {
        imports: [NgpToolbar, NgpRovingFocusItem],
      },
    );

    const item1 = getByTestId('item1');
    const item2 = getByTestId('item2');

    item1.focus();
    fixture.detectChanges();
    expect(document.activeElement).toBe(item1);

    item1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(item2);
  });

  it('should navigate between items with ArrowDown in vertical mode', async () => {
    const { getByTestId, fixture } = await render(
      `
      <div ngpToolbar ngpToolbarOrientation="vertical">
        <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
        <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
        <button data-testid="item3" ngpRovingFocusItem>Item 3</button>
      </div>
    `,
      {
        imports: [NgpToolbar, NgpRovingFocusItem],
      },
    );

    const item1 = getByTestId('item1');
    const item2 = getByTestId('item2');

    item1.focus();
    fixture.detectChanges();
    expect(document.activeElement).toBe(item1);

    item1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(item2);
  });

  it('should navigate backward with ArrowLeft in horizontal mode', async () => {
    const { getByTestId, fixture } = await render(
      `
      <div ngpToolbar>
        <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
        <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
      </div>
    `,
      {
        imports: [NgpToolbar, NgpRovingFocusItem],
      },
    );

    const item1 = getByTestId('item1');
    const item2 = getByTestId('item2');

    // Move to item2 first
    item1.focus();
    fixture.detectChanges();
    item1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(item2);

    // Navigate back to item1
    item2.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(item1);
  });

  it('should skip disabled items during navigation', async () => {
    const { getByTestId, fixture } = await render(
      `
      <div ngpToolbar>
        <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
        <button data-testid="item2" ngpRovingFocusItem ngpRovingFocusItemDisabled="true">Item 2</button>
        <button data-testid="item3" ngpRovingFocusItem>Item 3</button>
      </div>
    `,
      {
        imports: [NgpToolbar, NgpRovingFocusItem],
      },
    );

    const item1 = getByTestId('item1');
    const item3 = getByTestId('item3');

    item1.focus();
    fixture.detectChanges();

    item1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(item3);
  });
});
