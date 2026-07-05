import { Dir } from '@angular/cdk/bidi';
import { By } from '@angular/platform-browser';
import { fireEvent, render } from '@testing-library/angular';
import { NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { describe, expect, it } from 'vitest';
import { NgpToolbar } from '../toolbar';
import { NgpToolbarStateToken } from '../toolbar-state';

describe('NgpToolbar', () => {
  describe('roles & attributes', () => {
    it('should expose role="toolbar"', async () => {
      const { getByRole } = await render(`<div ngpToolbar></div>`, {
        imports: [NgpToolbar],
      });

      expect(getByRole('toolbar')).toBeTruthy();
    });

    it('should default to a horizontal orientation', async () => {
      const { getByRole } = await render(`<div ngpToolbar></div>`, {
        imports: [NgpToolbar],
      });

      const toolbar = getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
      expect(toolbar).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should reflect a vertical orientation', async () => {
      const { getByRole } = await render(
        `<div ngpToolbar ngpToolbarOrientation="vertical"></div>`,
        { imports: [NgpToolbar] },
      );

      const toolbar = getByRole('toolbar');
      expect(toolbar).toHaveAttribute('aria-orientation', 'vertical');
      expect(toolbar).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('keyboard navigation (horizontal)', () => {
    it('should move to the next item on ArrowRight', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div ngpToolbar>
          <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
          <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
          <button data-testid="item3" ngpRovingFocusItem>Item 3</button>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem] },
      );

      const item1 = getByTestId('item1');
      item1.focus();
      detectChanges();
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowRight' });
      detectChanges();

      expect(document.activeElement).toBe(getByTestId('item2'));
    });

    it('should move to the previous item on ArrowLeft', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div ngpToolbar>
          <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
          <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem] },
      );

      const item1 = getByTestId('item1');
      const item2 = getByTestId('item2');

      item1.focus();
      detectChanges();
      fireEvent.keyDown(item1, { key: 'ArrowRight' });
      detectChanges();
      expect(document.activeElement).toBe(item2);

      fireEvent.keyDown(item2, { key: 'ArrowLeft' });
      detectChanges();
      expect(document.activeElement).toBe(item1);
    });

    it('should ignore ArrowDown/ArrowUp in horizontal mode', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div ngpToolbar>
          <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
          <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem] },
      );

      const item1 = getByTestId('item1');
      item1.focus();
      detectChanges();

      fireEvent.keyDown(item1, { key: 'ArrowDown' });
      detectChanges();

      expect(document.activeElement).toBe(item1);
    });
  });

  describe('keyboard navigation (vertical)', () => {
    it('should move to the next item on ArrowDown', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div ngpToolbar ngpToolbarOrientation="vertical">
          <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
          <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem] },
      );

      const item1 = getByTestId('item1');
      item1.focus();
      detectChanges();

      fireEvent.keyDown(item1, { key: 'ArrowDown' });
      detectChanges();

      expect(document.activeElement).toBe(getByTestId('item2'));
    });

    it('should move to the previous item on ArrowUp', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div ngpToolbar ngpToolbarOrientation="vertical">
          <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
          <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem] },
      );

      const item1 = getByTestId('item1');
      const item2 = getByTestId('item2');

      item1.focus();
      detectChanges();
      fireEvent.keyDown(item1, { key: 'ArrowDown' });
      detectChanges();
      expect(document.activeElement).toBe(item2);

      fireEvent.keyDown(item2, { key: 'ArrowUp' });
      detectChanges();
      expect(document.activeElement).toBe(item1);
    });

    it('should ignore ArrowLeft/ArrowRight in vertical mode', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div ngpToolbar ngpToolbarOrientation="vertical">
          <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
          <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem] },
      );

      const item1 = getByTestId('item1');
      item1.focus();
      detectChanges();

      fireEvent.keyDown(item1, { key: 'ArrowRight' });
      detectChanges();

      expect(document.activeElement).toBe(item1);
    });
  });

  describe('Home / End', () => {
    it('should jump to the first item on Home', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div ngpToolbar>
          <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
          <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
          <button data-testid="item3" ngpRovingFocusItem>Item 3</button>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem] },
      );

      const item3 = getByTestId('item3');
      item3.focus();
      detectChanges();
      // seed the active item as the last one
      fireEvent.keyDown(getByTestId('item1'), { key: 'End' });
      detectChanges();
      expect(document.activeElement).toBe(item3);

      fireEvent.keyDown(item3, { key: 'Home' });
      detectChanges();

      expect(document.activeElement).toBe(getByTestId('item1'));
    });

    it('should jump to the last item on End', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div ngpToolbar>
          <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
          <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
          <button data-testid="item3" ngpRovingFocusItem>Item 3</button>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem] },
      );

      const item1 = getByTestId('item1');
      item1.focus();
      detectChanges();

      fireEvent.keyDown(item1, { key: 'End' });
      detectChanges();

      expect(document.activeElement).toBe(getByTestId('item3'));
    });

    it('should keep Home = first and End = last regardless of RTL', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div dir="rtl">
          <div ngpToolbar>
            <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
            <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
            <button data-testid="item3" ngpRovingFocusItem>Item 3</button>
          </div>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem, Dir] },
      );

      const item1 = getByTestId('item1');
      item1.focus();
      detectChanges();

      fireEvent.keyDown(item1, { key: 'End' });
      detectChanges();
      expect(document.activeElement).toBe(getByTestId('item3'));

      fireEvent.keyDown(getByTestId('item3'), { key: 'Home' });
      detectChanges();
      expect(document.activeElement).toBe(getByTestId('item1'));
    });
  });

  describe('direction (RTL)', () => {
    it('should move to the next item on ArrowLeft in horizontal RTL', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div dir="rtl">
          <div ngpToolbar>
            <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
            <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
          </div>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem, Dir] },
      );

      const item1 = getByTestId('item1');
      item1.focus();
      detectChanges();

      fireEvent.keyDown(item1, { key: 'ArrowLeft' });
      detectChanges();

      expect(document.activeElement).toBe(getByTestId('item2'));
    });

    it('should move to the previous item on ArrowRight in horizontal RTL', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div dir="rtl">
          <div ngpToolbar>
            <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
            <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
          </div>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem, Dir] },
      );

      const item1 = getByTestId('item1');
      const item2 = getByTestId('item2');

      item1.focus();
      detectChanges();
      // move focus to item2 first (ArrowLeft advances in RTL)
      fireEvent.keyDown(item1, { key: 'ArrowLeft' });
      detectChanges();
      expect(document.activeElement).toBe(item2);

      fireEvent.keyDown(item2, { key: 'ArrowRight' });
      detectChanges();
      expect(document.activeElement).toBe(item1);
    });
  });

  describe('disabled items', () => {
    it('should skip a disabled item during navigation', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div ngpToolbar>
          <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
          <button data-testid="item2" ngpRovingFocusItem ngpRovingFocusItemDisabled>Item 2</button>
          <button data-testid="item3" ngpRovingFocusItem>Item 3</button>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem] },
      );

      const item1 = getByTestId('item1');
      item1.focus();
      detectChanges();

      fireEvent.keyDown(item1, { key: 'ArrowRight' });
      detectChanges();

      expect(document.activeElement).toBe(getByTestId('item3'));
    });

    it('should not move focus when a disabled item receives a key press', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div ngpToolbar>
          <button data-testid="item1" ngpRovingFocusItem ngpRovingFocusItemDisabled>Item 1</button>
          <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem] },
      );

      const item1 = getByTestId('item1');
      item1.focus();
      detectChanges();

      fireEvent.keyDown(item1, { key: 'ArrowRight' });
      detectChanges();

      // the disabled item guards its own keydown so focus stays put
      expect(document.activeElement).toBe(item1);
    });
  });

  describe('roving focus tabindex', () => {
    it('should make only the active item tabbable', async () => {
      const { getByTestId } = await render(
        `<div ngpToolbar>
          <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
          <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem] },
      );

      expect(getByTestId('item1')).toHaveAttribute('tabindex', '0');
      expect(getByTestId('item2')).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('state API', () => {
    it('should sync the roving focus axis when the orientation changes', async () => {
      const { fixture, getByTestId, detectChanges } = await render(
        `<div ngpToolbar>
          <button data-testid="item1" ngpRovingFocusItem>Item 1</button>
          <button data-testid="item2" ngpRovingFocusItem>Item 2</button>
        </div>`,
        { imports: [NgpToolbar, NgpRovingFocusItem] },
      );

      const toolbar = fixture.debugElement.query(By.directive(NgpToolbar));
      const state = toolbar.injector.get(NgpToolbarStateToken)();

      state.setOrientation('vertical');
      detectChanges();

      const group = fixture.nativeElement.querySelector('[ngpToolbar]');
      expect(group).toHaveAttribute('aria-orientation', 'vertical');
      expect(group).toHaveAttribute('data-orientation', 'vertical');

      // navigation should now respond to the vertical axis
      const item1 = getByTestId('item1');
      item1.focus();
      detectChanges();

      fireEvent.keyDown(item1, { key: 'ArrowDown' });
      detectChanges();

      expect(document.activeElement).toBe(getByTestId('item2'));
    });
  });
});
