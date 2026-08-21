import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, minLength } from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { NgpToggleGroupItem } from 'ng-primitives/toggle-group';
import { describe, expect, it } from 'vitest';
import { ToggleGroup, ToggleGroupItemFixture } from './toggle-group-forms.fixture';

/** Read when the host is constructed, so a test can choose the field's starting value. */
let initialValue: string[] = [];

@Component({
  imports: [ToggleGroup, ToggleGroupItemFixture, NgpToggleGroupItem, SignalFormField],
  template: `
    <app-toggle-group [formField]="f.selection">
      <button app-toggle-group-item data-testid="item-1" value="option-1">1</button>
      <button app-toggle-group-item data-testid="item-2" value="option-2">2</button>
    </app-toggle-group>
  `,
})
class Host {
  readonly isDisabled = signal(false);
  readonly model = signal({ selection: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.selection, () => this.isDisabled());
    // `required` treats only ''/false/null as empty, so an empty array needs minLength.
    minLength(path.selection, 1);
  });
}

function renderHost(selection: string[] = []) {
  initialValue = selection;
  return render(Host);
}

describe('ToggleGroup (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { getByTestId, fixture } = await renderHost(['option-1']);

    expect(getByTestId('item-1')).toHaveAttribute('data-selected');
    expect(getByTestId('item-2')).not.toHaveAttribute('data-selected');
    expect(fixture.componentInstance.f.selection().value()).toEqual(['option-1']);
  });

  it('updates the model on click and the DOM on a model change', async () => {
    const { getByTestId, fixture } = await renderHost();
    const item1 = getByTestId('item-1');

    fireEvent.click(item1);
    await fixture.whenStable();
    expect(fixture.componentInstance.model().selection).toEqual(['option-1']);
    expect(item1).toHaveAttribute('data-selected');

    fixture.componentInstance.model.set({ selection: [] });
    await fixture.whenStable();
    expect(item1).not.toHaveAttribute('data-selected');
  });

  it('reflects the disabled state from the field', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(getByRole('group')).not.toHaveAttribute('data-disabled');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    expect(getByRole('group')).toHaveAttribute('data-disabled');
  });

  it('does not select while the field is disabled', async () => {
    const { getByTestId, fixture } = await renderHost();

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    fireEvent.click(getByTestId('item-1'));
    await fixture.whenStable();

    expect(fixture.componentInstance.model().selection).toEqual([]);
    expect(getByTestId('item-1')).not.toHaveAttribute('data-selected');
  });

  it('marks the field as touched on focusout', async () => {
    const { getByRole, fixture } = await renderHost();

    expect(fixture.componentInstance.f.selection().touched()).toBe(false);

    fireEvent.focusOut(getByRole('group'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f.selection().touched()).toBe(true);
  });

  it('reports validation errors from the field', async () => {
    const { getByTestId, fixture } = await renderHost();
    const field = fixture.componentInstance.f.selection;

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('minLength');

    fireEvent.click(getByTestId('item-1'));
    await fixture.whenStable();

    expect(field().valid()).toBe(true);
  });
});
