import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpRovingFocusGroup, NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { describe, expect, it } from 'vitest';

const imports = [NgpRovingFocusGroup, NgpRovingFocusItem];

describe('NgpRovingFocusGroup', () => {
  it('should initialise correctly', async () => {
    const container = await render(`<div ngpRovingFocusGroup></div>`, {
      imports: [NgpRovingFocusGroup],
    });
    expect(container.container).toBeTruthy();
  });

  it('should set tabindex="0" on the first item and "-1" on others', async () => {
    const container = await render(
      `<div ngpRovingFocusGroup>
        <button ngpRovingFocusItem data-testid="item-1">One</button>
        <button ngpRovingFocusItem data-testid="item-2">Two</button>
        <button ngpRovingFocusItem data-testid="item-3">Three</button>
      </div>`,
      { imports },
    );

    expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '0');
    expect(container.getByTestId('item-2')).toHaveAttribute('tabindex', '-1');
    expect(container.getByTestId('item-3')).toHaveAttribute('tabindex', '-1');
  });

  describe('vertical orientation (default)', () => {
    it('should move focus with ArrowDown', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup>
          <button ngpRovingFocusItem data-testid="item-1">One</button>
          <button ngpRovingFocusItem data-testid="item-2">Two</button>
          <button ngpRovingFocusItem data-testid="item-3">Three</button>
        </div>`,
        { imports },
      );

      const item1 = container.getByTestId('item-1');
      item1.focus();
      fireEvent.keyDown(item1, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(container.getByTestId('item-2')).toHaveAttribute('tabindex', '0');
        expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '-1');
      });
    });

    it('should move focus with ArrowUp', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup>
          <button ngpRovingFocusItem data-testid="item-1">One</button>
          <button ngpRovingFocusItem data-testid="item-2">Two</button>
          <button ngpRovingFocusItem data-testid="item-3">Three</button>
        </div>`,
        { imports },
      );

      const item2 = container.getByTestId('item-2');
      item2.click();
      fireEvent.keyDown(item2, { key: 'ArrowUp' });

      await waitFor(() => {
        expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '0');
      });
    });
  });

  describe('horizontal orientation', () => {
    it('should move focus with ArrowRight', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup ngpRovingFocusGroupOrientation="horizontal">
          <button ngpRovingFocusItem data-testid="item-1">One</button>
          <button ngpRovingFocusItem data-testid="item-2">Two</button>
          <button ngpRovingFocusItem data-testid="item-3">Three</button>
        </div>`,
        { imports },
      );

      const item1 = container.getByTestId('item-1');
      item1.focus();
      fireEvent.keyDown(item1, { key: 'ArrowRight' });

      await waitFor(() => {
        expect(container.getByTestId('item-2')).toHaveAttribute('tabindex', '0');
        expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '-1');
      });
    });

    it('should move focus with ArrowLeft', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup ngpRovingFocusGroupOrientation="horizontal">
          <button ngpRovingFocusItem data-testid="item-1">One</button>
          <button ngpRovingFocusItem data-testid="item-2">Two</button>
          <button ngpRovingFocusItem data-testid="item-3">Three</button>
        </div>`,
        { imports },
      );

      const item2 = container.getByTestId('item-2');
      item2.click();
      fireEvent.keyDown(item2, { key: 'ArrowLeft' });

      await waitFor(() => {
        expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '0');
      });
    });
  });

  describe('wrap behavior', () => {
    it('should wrap from last to first when wrap is enabled (default)', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup>
          <button ngpRovingFocusItem data-testid="item-1">One</button>
          <button ngpRovingFocusItem data-testid="item-2">Two</button>
        </div>`,
        { imports },
      );

      const item2 = container.getByTestId('item-2');
      item2.click();
      fireEvent.keyDown(item2, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '0');
      });
    });

    it('should not wrap when wrap is disabled', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup [ngpRovingFocusGroupWrap]="false">
          <button ngpRovingFocusItem data-testid="item-1">One</button>
          <button ngpRovingFocusItem data-testid="item-2">Two</button>
        </div>`,
        { imports },
      );

      const item2 = container.getByTestId('item-2');
      item2.click();
      fireEvent.keyDown(item2, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(container.getByTestId('item-2')).toHaveAttribute('tabindex', '0');
      });
    });
  });

  describe('Home/End keys', () => {
    it('should navigate to first item with Home key', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup>
          <button ngpRovingFocusItem data-testid="item-1">One</button>
          <button ngpRovingFocusItem data-testid="item-2">Two</button>
          <button ngpRovingFocusItem data-testid="item-3">Three</button>
        </div>`,
        { imports },
      );

      const item3 = container.getByTestId('item-3');
      item3.click();
      fireEvent.keyDown(item3, { key: 'Home' });

      await waitFor(() => {
        expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '0');
      });
    });

    it('should navigate to last item with End key', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup>
          <button ngpRovingFocusItem data-testid="item-1">One</button>
          <button ngpRovingFocusItem data-testid="item-2">Two</button>
          <button ngpRovingFocusItem data-testid="item-3">Three</button>
        </div>`,
        { imports },
      );

      const item1 = container.getByTestId('item-1');
      item1.focus();
      fireEvent.keyDown(item1, { key: 'End' });

      await waitFor(() => {
        expect(container.getByTestId('item-3')).toHaveAttribute('tabindex', '0');
      });
    });
  });

  describe('disabled items', () => {
    it('should skip disabled items during navigation', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup>
          <button ngpRovingFocusItem data-testid="item-1">One</button>
          <button ngpRovingFocusItem ngpRovingFocusItemDisabled data-testid="item-2">Two</button>
          <button ngpRovingFocusItem data-testid="item-3">Three</button>
        </div>`,
        { imports },
      );

      const item1 = container.getByTestId('item-1');
      item1.focus();
      fireEvent.keyDown(item1, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(container.getByTestId('item-3')).toHaveAttribute('tabindex', '0');
      });
    });

    it('should not leave the tab stop on an item that becomes disabled', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup>
          <button ngpRovingFocusItem data-testid="item-1">One</button>
          <button
            ngpRovingFocusItem
            [ngpRovingFocusItemDisabled]="off"
            data-testid="item-2">Two</button>
        </div>`,
        { imports, componentProperties: { off: false } },
      );

      container.getByTestId('item-2').click();
      await waitFor(() => expect(container.getByTestId('item-2')).toHaveAttribute('tabindex', '0'));

      await container.rerender({ componentProperties: { off: true } });

      // a disabled item is out of the tab order, so leaving the tab stop on it would take
      // the whole group out of the tab sequence
      await waitFor(() => {
        expect(container.getByTestId('item-2')).toHaveAttribute('tabindex', '-1');
        expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '0');
      });
    });

    it('should return the tab stop when the item is enabled again', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup>
          <button ngpRovingFocusItem data-testid="item-1">One</button>
          <button
            ngpRovingFocusItem
            [ngpRovingFocusItemDisabled]="off"
            data-testid="item-2">Two</button>
        </div>`,
        { imports, componentProperties: { off: false } },
      );

      container.getByTestId('item-2').click();
      await waitFor(() => expect(container.getByTestId('item-2')).toHaveAttribute('tabindex', '0'));

      await container.rerender({ componentProperties: { off: true } });
      await waitFor(() => expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '0'));

      await container.rerender({ componentProperties: { off: false } });

      await waitFor(() => {
        expect(container.getByTestId('item-2')).toHaveAttribute('tabindex', '0');
        expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '-1');
      });
    });

    it('should leave no tab stop when every item is disabled', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup>
          <button ngpRovingFocusItem ngpRovingFocusItemDisabled data-testid="item-1">One</button>
          <button ngpRovingFocusItem ngpRovingFocusItemDisabled data-testid="item-2">Two</button>
        </div>`,
        { imports },
      );

      expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '-1');
      expect(container.getByTestId('item-2')).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('registration order', () => {
    it('should give the tab stop to the first item in document order', async () => {
      // the @if blocks resolve back to front, so the items register in reverse document order
      const container = await render(
        `<div ngpRovingFocusGroup>
          @if (showFirst) {
            <button ngpRovingFocusItem data-testid="item-1">One</button>
          }
          @if (showSecond) {
            <button ngpRovingFocusItem data-testid="item-2">Two</button>
          }
          <button ngpRovingFocusItem data-testid="item-3">Three</button>
        </div>`,
        { imports, componentProperties: { showFirst: false, showSecond: false } },
      );

      await container.rerender({ componentProperties: { showFirst: false, showSecond: true } });
      await container.rerender({ componentProperties: { showFirst: true, showSecond: true } });
      await container.fixture.whenStable();

      expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '0');
      expect(container.getByTestId('item-2')).toHaveAttribute('tabindex', '-1');
      expect(container.getByTestId('item-3')).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('item removal', () => {
    // each item is behind its own @if so they register in the reverse of document order,
    // which is what projected or conditionally rendered content does in practice
    const outOfOrder = `<div ngpRovingFocusGroup>
      @if (showFirst) {
        <button ngpRovingFocusItem data-testid="item-1">One</button>
      }
      @if (showSecond) {
        <button ngpRovingFocusItem data-testid="item-2">Two</button>
      }
      @if (showThird) {
        <button ngpRovingFocusItem data-testid="item-3">Three</button>
      }
    </div>`;

    async function renderOutOfOrder() {
      const container = await render(outOfOrder, {
        imports,
        componentProperties: { showFirst: false, showSecond: false, showThird: true },
      });

      await container.rerender({
        componentProperties: { showFirst: false, showSecond: true, showThird: true },
      });
      await container.rerender({
        componentProperties: { showFirst: true, showSecond: true, showThird: true },
      });

      container.getByTestId('item-3').click();
      await container.fixture.whenStable();

      return container;
    }

    it('should hand the tab stop to the first item in document order', async () => {
      const container = await renderOutOfOrder();

      await container.rerender({
        componentProperties: { showFirst: true, showSecond: true, showThird: false },
      });
      await container.fixture.whenStable();

      expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '0');
      expect(container.getByTestId('item-2')).toHaveAttribute('tabindex', '-1');
    });

    it('should pick the same item whether or not focus has roved first', async () => {
      const container = await renderOutOfOrder();

      // navigating sorts the items, which must not change where the tab stop lands next
      fireEvent.keyDown(container.getByTestId('item-3'), { key: 'ArrowUp' });
      await container.fixture.whenStable();
      container.getByTestId('item-3').click();
      await container.fixture.whenStable();

      await container.rerender({
        componentProperties: { showFirst: true, showSecond: true, showThird: false },
      });
      await container.fixture.whenStable();

      expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '0');
      expect(container.getByTestId('item-2')).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('click activation', () => {
    it('should activate item on click', async () => {
      const container = await render(
        `<div ngpRovingFocusGroup>
          <button ngpRovingFocusItem data-testid="item-1">One</button>
          <button ngpRovingFocusItem data-testid="item-2">Two</button>
        </div>`,
        { imports },
      );

      const item2 = container.getByTestId('item-2');
      item2.click();

      await waitFor(() => {
        expect(item2).toHaveAttribute('tabindex', '0');
        expect(container.getByTestId('item-1')).toHaveAttribute('tabindex', '-1');
      });
    });
  });
});
