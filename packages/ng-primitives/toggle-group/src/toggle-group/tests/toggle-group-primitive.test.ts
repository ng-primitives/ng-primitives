import { Component } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { describe, expect, it, vi } from 'vitest';
import { NgpToggleGroupItem } from '../../toggle-group-item/toggle-group-item';
import { NgpToggleGroup } from '../toggle-group';
import { provideToggleGroupState } from '../toggle-group-state';

describe('NgpToggleGroup', () => {
  it('should set the default orientation', async () => {
    const { getByRole } = await render(
      `
      <div ngpToggleGroup>
        <div ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
        <div ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
      </div>
      `,
      {
        imports: [NgpToggleGroup, NgpToggleGroupItem],
      },
    );
    expect(getByRole('group')).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should set the orientation to vertical', async () => {
    const { getByRole } = await render(
      `
      <div ngpToggleGroup ngpToggleGroupOrientation="vertical">
        <div ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
        <div ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
      </div>
      `,
      {
        imports: [NgpToggleGroup, NgpToggleGroupItem],
      },
    );
    expect(getByRole('group')).toHaveAttribute('data-orientation', 'vertical');
  });

  describe('Single', () => {
    it('should have the expected defaults', async () => {
      const { getByRole } = await render(
        `
        <div ngpToggleGroup>
          <div ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const group = getByRole('group');
      expect(group).toHaveAttribute('data-type', 'single');
      expect(group).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should allow deselection', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupAllowDeselection="true">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      item1.click();
      expect(item1).not.toHaveAttribute('data-selected');
    });

    it('should not allow deselection when disabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupAllowDeselection="false">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(item1).toHaveAttribute('data-selected');
    });

    it('should emit valueChange on selection', async () => {
      const onValueChange = vi.fn();
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup (ngpToggleGroupValueChange)="onValueChange($event)">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
          componentProperties: { onValueChange },
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(onValueChange).toHaveBeenCalledWith(['option-1']);
      fireEvent.click(item1);
      expect(onValueChange).toHaveBeenCalledWith([]);
    });

    it('should not allow selection when disabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupDisabled="true">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(item1).not.toHaveAttribute('data-selected');
    });
  });

  describe('Multiple', () => {
    it('should have the expected defaults', async () => {
      const { getByRole } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupType="multiple">
          <div ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const group = getByRole('group');
      expect(group).toHaveAttribute('data-type', 'multiple');
      expect(group).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should allow multiple selections', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupType="multiple">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      fireEvent.click(item1);
      expect(item1).toHaveAttribute('data-selected');
      fireEvent.click(item2);
      expect(item2).toHaveAttribute('data-selected');
    });

    it('should allow deselection of individual items', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupType="multiple">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(item1).toHaveAttribute('data-selected');
      fireEvent.click(item1);
      expect(item1).not.toHaveAttribute('data-selected');
    });

    it('should emit valueChange on selection', async () => {
      const onValueChange = vi.fn();
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupType="multiple" (ngpToggleGroupValueChange)="onValueChange($event)">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
          componentProperties: { onValueChange },
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(onValueChange).toHaveBeenCalledWith(['option-1']);
      fireEvent.click(item1);
      expect(onValueChange).toHaveBeenCalledWith([]);
    });

    it('should not allow selection when disabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupType="multiple" ngpToggleGroupDisabled="true">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(item1).not.toHaveAttribute('data-selected');
    });
  });

  describe('defaultValue (uncontrolled)', () => {
    it('should initialize with empty array when no defaultValue is provided', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup>
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        { imports: [NgpToggleGroup, NgpToggleGroupItem] },
      );

      expect(getByTestId('toggle-item-1')).not.toHaveAttribute('data-selected');
      expect(getByTestId('toggle-item-2')).not.toHaveAttribute('data-selected');
    });

    it('should initialize with defaultValue when provided', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup [ngpToggleGroupDefaultValue]="['option-1']">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        { imports: [NgpToggleGroup, NgpToggleGroupItem] },
      );

      expect(getByTestId('toggle-item-1')).toHaveAttribute('data-selected');
      expect(getByTestId('toggle-item-2')).not.toHaveAttribute('data-selected');
    });

    it('should toggle from defaultValue state on click', async () => {
      const spy = vi.fn();
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup [ngpToggleGroupDefaultValue]="['option-1']" (ngpToggleGroupValueChange)="onValueChange($event)">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
          componentProperties: { onValueChange: spy },
        },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      expect(item1).toHaveAttribute('data-selected');

      fireEvent.click(item2);
      expect(spy).toHaveBeenCalledWith(['option-2']);
      expect(item1).not.toHaveAttribute('data-selected');
      expect(item2).toHaveAttribute('data-selected');
    });

    it('should not reset internal state when defaultValue changes after user interaction', async () => {
      const { getByTestId, rerender } = await render(
        `
        <div ngpToggleGroup [ngpToggleGroupDefaultValue]="defaultValue">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
          componentProperties: { defaultValue: ['option-1'] },
        },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      expect(item1).toHaveAttribute('data-selected');

      fireEvent.click(item2);
      expect(item2).toHaveAttribute('data-selected');
      expect(item1).not.toHaveAttribute('data-selected');

      await rerender({
        componentProperties: { defaultValue: ['option-1'] },
      });
      expect(item2).toHaveAttribute('data-selected');
      expect(item1).not.toHaveAttribute('data-selected');
    });

    it('should use controlled value over defaultValue when both provided', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup [ngpToggleGroupValue]="['option-2']" [ngpToggleGroupDefaultValue]="['option-1']">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        { imports: [NgpToggleGroup, NgpToggleGroupItem] },
      );

      expect(getByTestId('toggle-item-1')).not.toHaveAttribute('data-selected');
      expect(getByTestId('toggle-item-2')).toHaveAttribute('data-selected');
    });

    it('should toggle on click with no defaultValue and no value binding', async () => {
      const spy = vi.fn();
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup (ngpToggleGroupValueChange)="onValueChange($event)">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
          componentProperties: { onValueChange: spy },
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(spy).toHaveBeenCalledWith(['option-1']);
      expect(item1).toHaveAttribute('data-selected');

      fireEvent.click(item1);
      expect(spy).toHaveBeenCalledWith([]);
      expect(item1).not.toHaveAttribute('data-selected');
    });
  });

  describe('controlled mode', () => {
    it('should reflect controlled value binding', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup [ngpToggleGroupValue]="['option-1']">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        { imports: [NgpToggleGroup, NgpToggleGroupItem] },
      );

      expect(getByTestId('toggle-item-1')).toHaveAttribute('data-selected');
      expect(getByTestId('toggle-item-2')).not.toHaveAttribute('data-selected');
    });

    it('should update the DOM when controlled value changes via two-way binding on click', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup [(ngpToggleGroupValue)]="value">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
          componentProperties: { value: [] as string[] },
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(item1).toHaveAttribute('data-selected');

      fireEvent.click(item1);
      expect(item1).not.toHaveAttribute('data-selected');
    });

    it('should emit valueChange on click but not update DOM without parent updating binding', async () => {
      const spy = vi.fn();
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup [ngpToggleGroupValue]="value" (ngpToggleGroupValueChange)="onValueChange($event)">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
          componentProperties: { value: [] as string[], onValueChange: spy },
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);

      expect(spy).toHaveBeenCalledWith(['option-1']);
      expect(item1).not.toHaveAttribute('data-selected');
    });
  });

  describe('Focus Management', () => {
    it('should allow focus wrapping by default', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup>
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        { imports: [NgpToggleGroup, NgpToggleGroupItem] },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      const item3 = getByTestId('toggle-item-3');

      item1.focus();
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item2);

      fireEvent.keyDown(item2, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item3);

      fireEvent.keyDown(item3, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item1);
    });

    it('should allow reverse focus wrapping by default', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup>
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        { imports: [NgpToggleGroup, NgpToggleGroupItem] },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      const item3 = getByTestId('toggle-item-3');

      item1.focus();
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(item3);

      fireEvent.keyDown(item3, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(item2);

      fireEvent.keyDown(item2, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(item1);
    });

    it('should not wrap focus when wrap is disabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupWrap="false">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        { imports: [NgpToggleGroup, NgpToggleGroupItem] },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      const item3 = getByTestId('toggle-item-3');

      item1.focus();
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowRight', code: 'ArrowRight' });
      fireEvent.keyDown(item2, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item3);

      fireEvent.keyDown(item3, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item3);

      fireEvent.keyDown(item3, { key: 'ArrowLeft', code: 'ArrowLeft' });
      fireEvent.keyDown(item2, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(item1);
    });

    it('should handle focus wrapping in vertical orientation', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupOrientation="vertical">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        { imports: [NgpToggleGroup, NgpToggleGroupItem] },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      const item3 = getByTestId('toggle-item-3');

      item1.focus();
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(item2, { key: 'ArrowDown', code: 'ArrowDown' });
      expect(document.activeElement).toBe(item3);

      fireEvent.keyDown(item3, { key: 'ArrowDown', code: 'ArrowDown' });
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowUp', code: 'ArrowUp' });
      expect(document.activeElement).toBe(item3);
    });

    it('should not wrap focus in vertical orientation when wrap is disabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupOrientation="vertical" ngpToggleGroupWrap="false">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        { imports: [NgpToggleGroup, NgpToggleGroupItem] },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      const item3 = getByTestId('toggle-item-3');

      item1.focus();
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(item2, { key: 'ArrowDown', code: 'ArrowDown' });
      expect(document.activeElement).toBe(item3);

      fireEvent.keyDown(item3, { key: 'ArrowDown', code: 'ArrowDown' });
      expect(document.activeElement).toBe(item3);

      fireEvent.keyDown(item3, { key: 'ArrowUp', code: 'ArrowUp' });
      fireEvent.keyDown(item2, { key: 'ArrowUp', code: 'ArrowUp' });
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowUp', code: 'ArrowUp' });
      expect(document.activeElement).toBe(item1);
    });

    it('should respect wrap setting in multiple type toggle group', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupType="multiple" ngpToggleGroupWrap="false">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        { imports: [NgpToggleGroup, NgpToggleGroupItem] },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      const item3 = getByTestId('toggle-item-3');

      item1.focus();
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowRight', code: 'ArrowRight' });
      fireEvent.keyDown(item2, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item3);

      fireEvent.keyDown(item3, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item3);
    });

    it('should disable keyboard navigation when toggle group is disabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupDisabled="true">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        { imports: [NgpToggleGroup, NgpToggleGroupItem] },
      );

      const item1 = getByTestId('toggle-item-1');

      item1.focus();
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(item1);
    });
  });

  describe('state hoisting with projected content', () => {
    @Component({
      selector: 'app-hoisted-toggle-group',
      template: `
        <div ngpToggleGroup>
          <ng-content />
        </div>
      `,
      providers: [provideToggleGroupState(), provideRovingFocusGroupState()],
      imports: [NgpToggleGroup],
    })
    class HoistedToggleGroup {}

    it('should not throw when items are projected into a hoisted toggle group', async () => {
      await expect(
        render(
          `
          <app-hoisted-toggle-group>
            <div data-testid="item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
            <div data-testid="item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          </app-hoisted-toggle-group>
          `,
          {
            imports: [HoistedToggleGroup, NgpToggleGroupItem],
          },
        ),
      ).resolves.toBeDefined();
    });

    it('should navigate with arrow keys when items are projected into a hoisted toggle group', async () => {
      const { getByTestId } = await render(
        `
        <app-hoisted-toggle-group>
          <div data-testid="item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </app-hoisted-toggle-group>
        `,
        {
          imports: [HoistedToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('item-1');
      const item2 = getByTestId('item-2');
      const item3 = getByTestId('item-3');

      item1.focus();
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item2);

      fireEvent.keyDown(item2, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item3);

      fireEvent.keyDown(item3, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item1);
    });

    it('should toggle selection when clicking projected items', async () => {
      const { getByTestId } = await render(
        `
        <app-hoisted-toggle-group>
          <div data-testid="item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </app-hoisted-toggle-group>
        `,
        {
          imports: [HoistedToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('item-1');
      fireEvent.click(item1);
      expect(item1).toHaveAttribute('data-selected');
    });
  });
});
