import { fireEvent, render } from '@testing-library/angular';
import { NgpRadioGroup, NgpRadioIndicator, NgpRadioItem } from 'ng-primitives/radio';
import { describe, expect, it, vi } from 'vitest';

describe('RadioGroup', () => {
  it('should set to horizontal orientation by default', async () => {
    const { getByRole } = await render(
      `<div ngpRadioGroup>
        <div ngpRadioItem ngpRadioItemValue="1">One</div>
        <div ngpRadioItem ngpRadioItemValue="2">Two</div>
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
        <div ngpRadioItem ngpRadioItemValue="2">Two</div>
      </div>`,
      { imports: [NgpRadioGroup, NgpRadioItem] },
    );

    expect(getByRole('radiogroup')).toHaveAttribute('data-orientation', 'vertical');
    expect(getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('should set to disabled', async () => {
    const { getByRole } = await render(
      `<div ngpRadioGroup ngpRadioGroupDisabled>
        <div ngpRadioItem ngpRadioItemValue="1">One</div>
        <div ngpRadioItem ngpRadioItemValue="2">Two</div>
      </div>`,
      { imports: [NgpRadioGroup, NgpRadioItem] },
    );

    expect(getByRole('radiogroup')).toHaveAttribute('data-disabled', '');
  });

  it('should not select any item by default', async () => {
    const { getByRole } = await render(
      `<div ngpRadioGroup>
        <div ngpRadioItem ngpRadioItemValue="1">One</div>
        <div ngpRadioItem ngpRadioItemValue="2">Two</div>
      </div>`,
      { imports: [NgpRadioGroup, NgpRadioItem] },
    );

    expect(getByRole('radio', { name: 'One' })).not.toHaveAttribute('aria-checked', 'true');
    expect(getByRole('radio', { name: 'One' })).not.toHaveAttribute('data-checked', 'true');
    expect(getByRole('radio', { name: 'Two' })).not.toHaveAttribute('aria-checked', 'true');
    expect(getByRole('radio', { name: 'Two' })).not.toHaveAttribute('data-checked', 'true');
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

  it('should select an item when the value is set', async () => {
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
    expect(getByRole('radio', { name: 'Two' })).not.toHaveAttribute('aria-checked', 'true');
    expect(getByRole('radio', { name: 'Two' })).not.toHaveAttribute('data-checked');
  });

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

  it('should set tabindex="0" on selected item and "-1" on others', async () => {
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

  it('should handle disabled individual radio items', async () => {
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
    expect(radioTwo).toHaveAttribute('data-disabled');

    radioTwo.click();
    expect(valueChange).not.toHaveBeenCalled();
  });

  it('should render radio-indicator with data-checked state', async () => {
    const { getByTestId, detectChanges } = await render(
      `<div ngpRadioGroup [(ngpRadioGroupValue)]="value">
        <div ngpRadioItem ngpRadioItemValue="1">
          <span ngpRadioIndicator data-testid="indicator-1"></span>
          One
        </div>
        <div ngpRadioItem ngpRadioItemValue="2">
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

    expect(getByTestId('indicator-1')).toHaveAttribute('data-checked');
    expect(getByTestId('indicator-2')).not.toHaveAttribute('data-checked');
  });
});
