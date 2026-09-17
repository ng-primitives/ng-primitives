import { Component, signal } from '@angular/core';
import { FormField as SignalFormField, disabled, form, max } from '@angular/forms/signals';
import { fireEvent, render } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { Pagination } from './pagination-forms.fixture';

/** Read when the host is constructed, so a test can choose the field's starting value. */
let initialValue = 1;

@Component({
  imports: [Pagination, SignalFormField],
  template: `
    <app-pagination [formField]="f.page" pageCount="5" />
  `,
})
class Host {
  readonly isDisabled = signal(false);
  readonly model = signal({ page: initialValue });
  readonly f = form(this.model, path => {
    disabled(path.page, () => this.isDisabled());
    max(path.page, 3);
  });
}

function renderHost(page = 1) {
  initialValue = page;
  return render(Host);
}

describe('Pagination (reusable component) — signal forms', () => {
  it('reflects the initial field value', async () => {
    const { getByRole, fixture } = await renderHost(2);
    await fixture.whenStable();

    expect(getByRole('navigation')).toHaveAttribute('data-page', '2');
    expect(fixture.componentInstance.f.page().value()).toBe(2);
  });

  it('updates the model on click and the DOM on a model change', async () => {
    const { getByRole, fixture } = await renderHost(1);
    await fixture.whenStable();

    fireEvent.click(getByRole('button', { name: 'Page 3' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().page).toBe(3);
    expect(getByRole('navigation')).toHaveAttribute('data-page', '3');

    fixture.componentInstance.model.set({ page: 5 });
    await fixture.whenStable();
    expect(getByRole('navigation')).toHaveAttribute('data-page', '5');
    expect(getByRole('button', { name: 'Page 5' })).toHaveAttribute('data-selected', '');
  });

  it('reflects the disabled state from the field', async () => {
    const { getByRole, fixture } = await renderHost(1);
    await fixture.whenStable();

    expect(getByRole('navigation')).not.toHaveAttribute('data-disabled');
    expect(getByRole('button', { name: 'Next Page' })).toHaveAttribute('tabindex', '0');

    fixture.componentInstance.isDisabled.set(true);
    await fixture.whenStable();

    expect(getByRole('navigation')).toHaveAttribute('data-disabled', '');
    expect(getByRole('button', { name: 'Next Page' })).toHaveAttribute('tabindex', '-1');

    fireEvent.click(getByRole('button', { name: 'Page 3' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().page).toBe(1);

    fixture.componentInstance.isDisabled.set(false);
    await fixture.whenStable();

    expect(getByRole('navigation')).not.toHaveAttribute('data-disabled');
    expect(getByRole('button', { name: 'Next Page' })).toHaveAttribute('tabindex', '0');

    fireEvent.click(getByRole('button', { name: 'Page 3' }));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().page).toBe(3);
  });

  it('marks the field as touched on focusout', async () => {
    const { getByRole, fixture } = await renderHost(1);
    await fixture.whenStable();

    expect(fixture.componentInstance.f.page().touched()).toBe(false);

    fireEvent.focusOut(getByRole('navigation'));
    await fixture.whenStable();

    expect(fixture.componentInstance.f.page().touched()).toBe(true);
  });

  it('reports validation errors from the field', async () => {
    const { getByRole, fixture } = await renderHost(1);
    await fixture.whenStable();
    const field = fixture.componentInstance.f.page;

    expect(field().valid()).toBe(true);

    fireEvent.click(getByRole('button', { name: 'Page 5' }));
    await fixture.whenStable();

    expect(field().invalid()).toBe(true);
    expect(field().errors()[0].kind).toBe('max');
  });
});
