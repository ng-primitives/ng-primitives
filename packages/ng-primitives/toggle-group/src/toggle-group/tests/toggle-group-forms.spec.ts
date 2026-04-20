import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render } from '@testing-library/angular';
import { NgpToggleGroupItem } from '../../toggle-group-item/toggle-group-item';
import { ToggleGroup, ToggleGroupItemFixture } from './toggle-group-forms.fixture';

describe('ToggleGroup (reusable component) — template-driven forms', () => {
  it('binds with [(ngModel)] two-way', async () => {
    const ngModelChange = vi.fn();
    const { getByTestId, fixture, rerender } = await render(
      `
      <app-toggle-group [(ngModel)]="value" (ngModelChange)="ngModelChange($event)">
        <button app-toggle-group-item data-testid="item-1" value="option-1">1</button>
        <button app-toggle-group-item data-testid="item-2" value="option-2">2</button>
      </app-toggle-group>
      `,
      {
        imports: [ToggleGroup, ToggleGroupItemFixture, NgpToggleGroupItem, FormsModule],
        componentProperties: { value: [] as string[], ngModelChange },
      },
    );

    await fixture.whenStable();
    const item1 = getByTestId('item-1');
    expect(item1).not.toHaveAttribute('data-selected');

    fireEvent.click(item1);
    await fixture.whenStable();
    expect(item1).toHaveAttribute('data-selected');
    expect(ngModelChange).toHaveBeenCalledTimes(1);
    expect(ngModelChange).toHaveBeenLastCalledWith(['option-1']);

    // External update — writeValue must NOT echo back through onChange
    await rerender({ componentProperties: { value: [], ngModelChange } });
    await fixture.whenStable();
    expect(item1).not.toHaveAttribute('data-selected');
    expect(ngModelChange).toHaveBeenCalledTimes(1);
  });
});

describe('ToggleGroup (reusable component) — reactive forms', () => {
  it('reflects initial form control value', async () => {
    const formControl = new FormControl(['option-1']);
    const { getByTestId } = await render(
      `
      <app-toggle-group [formControl]="formControl">
        <button app-toggle-group-item data-testid="item-1" value="option-1">1</button>
        <button app-toggle-group-item data-testid="item-2" value="option-2">2</button>
      </app-toggle-group>
      `,
      {
        imports: [ToggleGroup, ToggleGroupItemFixture, NgpToggleGroupItem, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    expect(getByTestId('item-1')).toHaveAttribute('data-selected');
    expect(getByTestId('item-2')).not.toHaveAttribute('data-selected');
    expect(formControl.value).toEqual(['option-1']);
  });

  it('updates form control on click and DOM on setValue', async () => {
    const formControl = new FormControl<string[]>([]);
    const { getByTestId, fixture } = await render(
      `
      <app-toggle-group [formControl]="formControl">
        <button app-toggle-group-item data-testid="item-1" value="option-1">1</button>
        <button app-toggle-group-item data-testid="item-2" value="option-2">2</button>
      </app-toggle-group>
      `,
      {
        imports: [ToggleGroup, ToggleGroupItemFixture, NgpToggleGroupItem, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    const item1 = getByTestId('item-1');

    fireEvent.click(item1);
    expect(formControl.value).toEqual(['option-1']);
    expect(item1).toHaveAttribute('data-selected');

    formControl.setValue([]);
    fixture.detectChanges();
    expect(item1).not.toHaveAttribute('data-selected');
  });

  it('reflects disabled state from form control', async () => {
    const formControl = new FormControl<string[]>([]);
    const { getByRole, fixture } = await render(
      `
      <app-toggle-group [formControl]="formControl">
        <button app-toggle-group-item data-testid="item-1" value="option-1">1</button>
        <button app-toggle-group-item data-testid="item-2" value="option-2">2</button>
      </app-toggle-group>
      `,
      {
        imports: [ToggleGroup, ToggleGroupItemFixture, NgpToggleGroupItem, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    formControl.disable();
    fixture.detectChanges();
    expect(getByRole('group')).toHaveAttribute('data-disabled');
  });

  it('does not loop writeValue back through onChange (regression)', async () => {
    const formControl = new FormControl<string[]>([]);
    const { fixture } = await render(
      `
      <app-toggle-group [formControl]="formControl">
        <button app-toggle-group-item data-testid="item-1" value="option-1">1</button>
        <button app-toggle-group-item data-testid="item-2" value="option-2">2</button>
      </app-toggle-group>
      `,
      {
        imports: [ToggleGroup, ToggleGroupItemFixture, NgpToggleGroupItem, ReactiveFormsModule],
        componentProperties: { formControl },
      },
    );

    const spy = vi.fn();
    formControl.valueChanges.subscribe(spy);

    formControl.setValue(['option-1']);
    fixture.detectChanges();

    // Exactly one emission (from setValue itself).
    // If writeValue called setValue without { emit: false }, this would fire twice.
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(['option-1']);
  });
});
