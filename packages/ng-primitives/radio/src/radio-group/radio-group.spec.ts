import { fireEvent, render } from '@testing-library/angular';
import { NgpRadioGroup, NgpRadioItem } from 'ng-primitives/radio';

describe('RadioGroup', () => {
  it('should set to horizontal orientation by default', async () => {
    const { getByRole } = await render(
      `
      <div ngpRadioGroup>
        <div ngpRadioItem ngpRadioItemValue="1">One</div>
        <div ngpRadioItem ngpRadioItemValue="2">Two</div>
      </div>
    `,
      {
        imports: [NgpRadioGroup, NgpRadioItem],
      },
    );

    expect(getByRole('radiogroup')).toHaveAttribute('data-orientation', 'horizontal');
    expect(getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('should set to vertical orientation', async () => {
    const { getByRole } = await render(
      `
      <div ngpRadioGroup ngpRadioGroupOrientation="vertical">
        <div ngpRadioItem ngpRadioItemValue="1">One</div>
        <div ngpRadioItem ngpRadioItemValue="2">Two</div>
      </div>
    `,
      {
        imports: [NgpRadioGroup, NgpRadioItem],
      },
    );

    expect(getByRole('radiogroup')).toHaveAttribute('data-orientation', 'vertical');
    expect(getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('should set to disabled', async () => {
    const { getByRole } = await render(
      `
      <div ngpRadioGroup ngpRadioGroupDisabled>
        <div ngpRadioItem ngpRadioItemValue="1">One</div>
        <div ngpRadioItem ngpRadioItemValue="2">Two</div>
      </div>
    `,
      {
        imports: [NgpRadioGroup, NgpRadioItem],
      },
    );

    expect(getByRole('radiogroup')).toHaveAttribute('data-disabled', '');
  });

  it('should not select any item by default', async () => {
    const { getByRole } = await render(
      `
      <div ngpRadioGroup>
        <div ngpRadioItem ngpRadioItemValue="1">One</div>
        <div ngpRadioItem ngpRadioItemValue="2">Two</div>
      </div>
    `,
      {
        imports: [NgpRadioGroup, NgpRadioItem],
      },
    );

    expect(getByRole('radio', { name: 'One' })).not.toHaveAttribute('aria-checked', 'true');
    expect(getByRole('radio', { name: 'One' })).not.toHaveAttribute('data-checked', 'true');
    expect(getByRole('radio', { name: 'Two' })).not.toHaveAttribute('aria-checked', 'true');
    expect(getByRole('radio', { name: 'Two' })).not.toHaveAttribute('data-checked', 'true');
  });

  it('should select an item when clicked', async () => {
    const valueChange = jest.fn();

    const { getByRole, detectChanges } = await render(
      `
      <div ngpRadioGroup (ngpRadioGroupValueChange)="valueChange($event)">
        <div ngpRadioItem ngpRadioItemValue="1">One</div>
        <div ngpRadioItem ngpRadioItemValue="2">Two</div>
      </div>
    `,
      {
        imports: [NgpRadioGroup, NgpRadioItem],
        componentProperties: {
          valueChange,
        },
      },
    );

    const radioOne = getByRole('radio', { name: 'One' });
    const radioTwo = getByRole('radio', { name: 'Two' });

    fireEvent.click(radioOne);
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
      `
      <div ngpRadioGroup [(ngpRadioGroupValue)]="value">
        <div ngpRadioItem ngpRadioItemValue="1">One</div>
        <div ngpRadioItem ngpRadioItemValue="2">Two</div>
      </div>
    `,
      {
        imports: [NgpRadioGroup, NgpRadioItem],
        componentProperties: {
          value: '1',
        },
      },
    );

    const radioOne = getByRole('radio', { name: 'One' });
    const radioTwo = getByRole('radio', { name: 'Two' });

    detectChanges();

    expect(radioOne).toHaveAttribute('aria-checked', 'true');
    expect(radioOne).toHaveAttribute('data-checked', '');
    expect(radioTwo).not.toHaveAttribute('aria-checked', 'true');
    expect(radioTwo).not.toHaveAttribute('data-checked');
  });
});
