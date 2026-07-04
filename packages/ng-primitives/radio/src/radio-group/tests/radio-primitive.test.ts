import { By } from '@angular/platform-browser';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { NgpRadioIndicator } from '../../radio-indicator/radio-indicator';
import { NgpRadioItem } from '../../radio-item/radio-item';
import { NgpRadioGroup } from '../radio-group';

describe('NgpRadioGroup', () => {
  describe('roles & attributes', () => {
    it('should set role="radiogroup" on the container', async () => {
      const { getByRole } = await render(
        `<div ngpRadioGroup>
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
        </div>`,
        { imports: [NgpRadioGroup, NgpRadioItem] },
      );
      expect(getByRole('radiogroup')).toBeTruthy();
    });

    it('should set role="radio" on each item', async () => {
      const { getAllByRole } = await render(
        `<div ngpRadioGroup>
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
        </div>`,
        { imports: [NgpRadioGroup, NgpRadioItem] },
      );
      expect(getAllByRole('radio')).toHaveLength(2);
    });

    it('should set to horizontal orientation by default', async () => {
      const { getByRole } = await render(
        `<div ngpRadioGroup>
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
        </div>`,
        { imports: [NgpRadioGroup, NgpRadioItem] },
      );

      expect(getByRole('radiogroup')).toHaveAttribute('data-orientation', 'horizontal');
      expect(getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should set to vertical orientation', async () => {
      const { getByRole } = await render(
        `<div ngpRadioGroup ngpRadioGroupOrientation="vertical">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
        </div>`,
        { imports: [NgpRadioGroup, NgpRadioItem] },
      );

      expect(getByRole('radiogroup')).toHaveAttribute('data-orientation', 'vertical');
      expect(getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'vertical');
    });

    it('should set data-disabled when the group is disabled', async () => {
      const { getByRole } = await render(
        `<div ngpRadioGroup ngpRadioGroupDisabled>
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
        </div>`,
        { imports: [NgpRadioGroup, NgpRadioItem] },
      );

      expect(getByRole('radiogroup')).toHaveAttribute('data-disabled', '');
    });

    it('should apply a generated id by default', async () => {
      const { getByRole } = await render(
        `<div ngpRadioGroup>
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
        </div>`,
        { imports: [NgpRadioGroup, NgpRadioItem] },
      );

      expect(getByRole('radiogroup').id).toMatch(/^ngp-radio-group-/);
    });

    it('should reflect a custom id', async () => {
      const { getByRole } = await render(
        `<div ngpRadioGroup id="my-radios">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
        </div>`,
        { imports: [NgpRadioGroup, NgpRadioItem] },
      );

      expect(getByRole('radiogroup')).toHaveAttribute('id', 'my-radios');
    });
  });

  describe('selection', () => {
    it('should not select any item by default', async () => {
      const { getByRole } = await render(
        `<div ngpRadioGroup>
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
        </div>`,
        { imports: [NgpRadioGroup, NgpRadioItem] },
      );

      expect(getByRole('radio', { name: 'One' })).toHaveAttribute('aria-checked', 'false');
      expect(getByRole('radio', { name: 'One' })).not.toHaveAttribute('data-checked');
      expect(getByRole('radio', { name: 'Two' })).toHaveAttribute('aria-checked', 'false');
      expect(getByRole('radio', { name: 'Two' })).not.toHaveAttribute('data-checked');
    });

    it('should select an item when clicked', async () => {
      const valueChange = vi.fn();

      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioOne = getByRole('radio', { name: 'One' });
      const radioTwo = getByRole('radio', { name: 'Two' });

      radioOne.click();
      detectChanges();

      expect(radioOne).toHaveAttribute('aria-checked', 'true');
      expect(radioOne).toHaveAttribute('data-checked', '');
      expect(radioTwo).not.toHaveAttribute('aria-checked', 'true');
      expect(radioTwo).not.toHaveAttribute('data-checked');

      expect(valueChange).toHaveBeenCalledWith('1');
      expect(valueChange).toHaveBeenCalledTimes(1);
      expect(radioOne).toHaveFocus();
      expect(radioTwo).not.toHaveFocus();
    });

    it('should move selection to another item when clicked', async () => {
      const valueChange = vi.fn();
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioOne = getByRole('radio', { name: 'One' });
      const radioTwo = getByRole('radio', { name: 'Two' });

      radioOne.click();
      detectChanges();
      radioTwo.click();
      detectChanges();

      expect(radioTwo).toHaveAttribute('data-checked', '');
      expect(radioOne).not.toHaveAttribute('data-checked');
      expect(valueChange).toHaveBeenLastCalledWith('2');
      expect(valueChange).toHaveBeenCalledTimes(2);
    });

    it('should not re-emit when the already-selected item is clicked', async () => {
      const valueChange = vi.fn();
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioOne = getByRole('radio', { name: 'One' });
      radioOne.click();
      detectChanges();
      radioOne.click();
      detectChanges();

      expect(valueChange).toHaveBeenCalledTimes(1);
    });

    it('should reflect the selected item when the value input is set', async () => {
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup [(ngpRadioGroupValue)]="value">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { value: '1' },
        },
      );

      detectChanges();

      expect(getByRole('radio', { name: 'One' })).toHaveAttribute('aria-checked', 'true');
      expect(getByRole('radio', { name: 'One' })).toHaveAttribute('data-checked', '');
      expect(getByRole('radio', { name: 'Two' })).not.toHaveAttribute('data-checked');
    });

    it('should compare object values with a custom compareWith', async () => {
      const options = [
        { id: 1, name: 'One' },
        { id: 2, name: 'Two' },
      ];
      const { getByRole, detectChanges } = await render(
        `<div
          ngpRadioGroup
          [ngpRadioGroupValue]="value"
          [ngpRadioGroupCompareWith]="compareWith"
        >
          <div ngpRadioItem [ngpRadioItemValue]="options[0]">One</div>
          <div ngpRadioItem [ngpRadioItemValue]="options[1]">Two</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: {
            options,
            // a fresh object with the same id must still match
            value: { id: 2, name: 'Two' },
            compareWith: (a: { id: number } | null, b: { id: number } | null) => a?.id === b?.id,
          },
        },
      );

      detectChanges();

      expect(getByRole('radio', { name: 'Two' })).toHaveAttribute('data-checked', '');
      expect(getByRole('radio', { name: 'One' })).not.toHaveAttribute('data-checked');
    });
  });

  describe('focus behaviour', () => {
    it('should select an item when it receives focus', async () => {
      const valueChange = vi.fn();
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioTwo = getByRole('radio', { name: 'Two' });
      radioTwo.focus();
      detectChanges();

      expect(valueChange).toHaveBeenCalledWith('2');
      expect(radioTwo).toHaveAttribute('data-checked', '');
    });

    it('should not select a disabled item when it receives focus', async () => {
      const valueChange = vi.fn();
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2" ngpRadioItemDisabled>Two</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioTwo = getByRole('radio', { name: 'Two' });
      radioTwo.focus();
      detectChanges();

      expect(valueChange).not.toHaveBeenCalled();
      expect(radioTwo).not.toHaveAttribute('data-checked');
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate with ArrowRight in horizontal orientation', async () => {
      const valueChange = vi.fn();
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
          <div ngpRadioItem ngpRadioItemValue="3">Three</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioOne = getByRole('radio', { name: 'One' });
      radioOne.focus();
      detectChanges();

      fireEvent.keyDown(radioOne, { key: 'ArrowRight' });
      detectChanges();

      expect(valueChange).toHaveBeenCalledWith('2');
    });

    it('should navigate with ArrowLeft in horizontal orientation', async () => {
      const valueChange = vi.fn();
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
          <div ngpRadioItem ngpRadioItemValue="3">Three</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioTwo = getByRole('radio', { name: 'Two' });
      radioTwo.click();
      detectChanges();
      valueChange.mockClear();

      fireEvent.keyDown(radioTwo, { key: 'ArrowLeft' });
      detectChanges();

      expect(valueChange).toHaveBeenCalledWith('1');
    });

    it('should navigate with ArrowDown in vertical orientation', async () => {
      const valueChange = vi.fn();
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup ngpRadioGroupOrientation="vertical" (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
          <div ngpRadioItem ngpRadioItemValue="3">Three</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioOne = getByRole('radio', { name: 'One' });
      radioOne.focus();
      detectChanges();

      fireEvent.keyDown(radioOne, { key: 'ArrowDown' });
      detectChanges();

      expect(valueChange).toHaveBeenCalledWith('2');
    });

    it('should navigate with ArrowUp in vertical orientation', async () => {
      const valueChange = vi.fn();
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup ngpRadioGroupOrientation="vertical" (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
          <div ngpRadioItem ngpRadioItemValue="3">Three</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioTwo = getByRole('radio', { name: 'Two' });
      radioTwo.click();
      detectChanges();
      valueChange.mockClear();

      fireEvent.keyDown(radioTwo, { key: 'ArrowUp' });
      detectChanges();

      expect(valueChange).toHaveBeenCalledWith('1');
    });

    it('should jump to the first and last items with Home and End', async () => {
      const valueChange = vi.fn();
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
          <div ngpRadioItem ngpRadioItemValue="3">Three</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioOne = getByRole('radio', { name: 'One' });
      radioOne.focus();
      detectChanges();

      fireEvent.keyDown(radioOne, { key: 'End' });
      detectChanges();
      expect(valueChange).toHaveBeenLastCalledWith('3');

      fireEvent.keyDown(getByRole('radio', { name: 'Three' }), { key: 'Home' });
      detectChanges();
      expect(valueChange).toHaveBeenLastCalledWith('1');
    });

    it('should skip disabled items during navigation', async () => {
      const valueChange = vi.fn();
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2" ngpRadioItemDisabled>Two</div>
          <div ngpRadioItem ngpRadioItemValue="3">Three</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioOne = getByRole('radio', { name: 'One' });
      radioOne.focus();
      detectChanges();

      fireEvent.keyDown(radioOne, { key: 'ArrowRight' });
      detectChanges();

      expect(valueChange).toHaveBeenCalledWith('3');
      expect(valueChange).not.toHaveBeenCalledWith('2');
    });

    it('should not select via click when the group is disabled', async () => {
      const valueChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpRadioGroup ngpRadioGroupDisabled (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioOne = getByRole('radio', { name: 'One' });
      radioOne.click();

      expect(valueChange).not.toHaveBeenCalled();
      expect(radioOne).not.toHaveAttribute('data-checked');
    });

    it('should not navigate when the group is disabled', async () => {
      const valueChange = vi.fn();
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup ngpRadioGroupDisabled (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioOne = getByRole('radio', { name: 'One' });
      fireEvent.keyDown(radioOne, { key: 'ArrowRight' });
      detectChanges();

      expect(valueChange).not.toHaveBeenCalled();
    });
  });

  describe('roving focus', () => {
    it('should set tabindex="0" on the selected item and "-1" on others', async () => {
      const { getByRole, detectChanges } = await render(
        `<div ngpRadioGroup [(ngpRadioGroupValue)]="value">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { value: '1' },
        },
      );
      detectChanges();

      expect(getByRole('radio', { name: 'One' })).toHaveAttribute('tabindex', '0');
      expect(getByRole('radio', { name: 'Two' })).toHaveAttribute('tabindex', '-1');
    });

    it('should update orientation and sync roving focus when setOrientation is called', async () => {
      const valueChange = vi.fn();
      const { fixture, getByRole, detectChanges } = await render(
        `<div ngpRadioGroup (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2">Two</div>
          <div ngpRadioItem ngpRadioItemValue="3">Three</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const group = getByRole('radiogroup');
      const radioGroup = fixture.debugElement
        .query(By.directive(NgpRadioGroup))
        .injector.get(NgpRadioGroup);

      radioGroup.setOrientation('vertical');
      detectChanges();

      expect(group).toHaveAttribute('aria-orientation', 'vertical');
      expect(group).toHaveAttribute('data-orientation', 'vertical');

      // the roving focus group should now navigate on the vertical axis
      const radioOne = getByRole('radio', { name: 'One' });
      radioOne.focus();
      detectChanges();

      fireEvent.keyDown(radioOne, { key: 'ArrowDown' });
      detectChanges();

      expect(valueChange).toHaveBeenCalledWith('2');
    });
  });

  describe('disabled items', () => {
    it('should expose data-disabled and block selection on a disabled item', async () => {
      const valueChange = vi.fn();
      const { getByRole } = await render(
        `<div ngpRadioGroup (ngpRadioGroupValueChange)="valueChange($event)">
          <div ngpRadioItem ngpRadioItemValue="1">One</div>
          <div ngpRadioItem ngpRadioItemValue="2" ngpRadioItemDisabled>Two</div>
          <div ngpRadioItem ngpRadioItemValue="3">Three</div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem],
          componentProperties: { valueChange },
        },
      );

      const radioTwo = getByRole('radio', { name: 'Two' });
      expect(radioTwo).toHaveAttribute('data-disabled', '');

      radioTwo.click();
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('should throw when a radio item has no value', async () => {
      await expect(
        render(
          `<div ngpRadioGroup>
            <div ngpRadioItem>One</div>
          </div>`,
          { imports: [NgpRadioGroup, NgpRadioItem] },
        ),
      ).rejects.toThrow('The `ngpRadioItem` directive requires a `value` input.');
    });
  });

  describe('indicator', () => {
    it('should mirror the checked and disabled state of its item', async () => {
      const { getByTestId, detectChanges } = await render(
        `<div ngpRadioGroup [(ngpRadioGroupValue)]="value">
          <div ngpRadioItem ngpRadioItemValue="1">
            <span ngpRadioIndicator data-testid="indicator-1"></span>
            One
          </div>
          <div ngpRadioItem ngpRadioItemValue="2" ngpRadioItemDisabled>
            <span ngpRadioIndicator data-testid="indicator-2"></span>
            Two
          </div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem, NgpRadioIndicator],
          componentProperties: { value: '1' },
        },
      );
      detectChanges();

      expect(getByTestId('indicator-1')).toHaveAttribute('data-checked', '');
      expect(getByTestId('indicator-2')).not.toHaveAttribute('data-checked');
      expect(getByTestId('indicator-2')).toHaveAttribute('data-disabled', '');
    });

    it('should honour a custom compareWith when computing checked', async () => {
      const options = [
        { id: 1, name: 'One' },
        { id: 2, name: 'Two' },
      ];
      const { getByTestId, detectChanges } = await render(
        `<div
          ngpRadioGroup
          [ngpRadioGroupValue]="value"
          [ngpRadioGroupCompareWith]="compareWith"
        >
          <div ngpRadioItem [ngpRadioItemValue]="options[0]">
            <span ngpRadioIndicator data-testid="indicator-1"></span>
            One
          </div>
          <div ngpRadioItem [ngpRadioItemValue]="options[1]">
            <span ngpRadioIndicator data-testid="indicator-2"></span>
            Two
          </div>
        </div>`,
        {
          imports: [NgpRadioGroup, NgpRadioItem, NgpRadioIndicator],
          componentProperties: {
            options,
            // a fresh object with the same id must still match by compareWith
            value: { id: 2, name: 'Two' },
            compareWith: (a: { id: number } | null, b: { id: number } | null) => a?.id === b?.id,
          },
        },
      );
      detectChanges();

      expect(getByTestId('indicator-2')).toHaveAttribute('data-checked', '');
      expect(getByTestId('indicator-1')).not.toHaveAttribute('data-checked');
    });
  });
});
