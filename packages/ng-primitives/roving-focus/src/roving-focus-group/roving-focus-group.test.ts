import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpRovingFocusGroup, NgpRovingFocusItem } from 'ng-primitives/roving-focus';
import { describe, expect, it } from 'vitest';

const imports = [NgpRovingFocusGroup, NgpRovingFocusItem];

@Component({
  imports,
  template: `
    <div ngpRovingFocusGroup>
      <button ngpRovingFocusItem data-testid="item-1">One</button>
      <button ngpRovingFocusItem data-testid="item-2">Two</button>
    </div>
  `,
})
class RovingFocusHost {}

describe('NgpRovingFocusGroup', () => {
  it('should make the active item tabbable during the initial change detection', () => {
    // The active (first) item must be tabindex="0" during CD - not deferred to
    // the post-render phase - so a focus trap focusing the group on open finds
    // it tabbable. Drive CD directly (the fixture also flushes afterRender), so
    // this fails if the active item only becomes tabbable a frame later.
    const fixture = TestBed.createComponent(RovingFocusHost);
    fixture.changeDetectorRef.detectChanges();

    const item = (id: string): HTMLElement =>
      fixture.nativeElement.querySelector(`[data-testid="${id}"]`);
    expect(item('item-1').getAttribute('tabindex')).toBe('0');
    expect(item('item-2').getAttribute('tabindex')).toBe('-1');
  });

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
