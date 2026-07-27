import { Component, signal } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpScrollBehavior, NgpShift } from 'ng-primitives/portal';
import { afterEach, describe, expect, it } from 'vitest';
import { NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal } from '../../index';

@Component({
  template: `
    <div class="spacer"></div>
    <div
      [ngpSelectDropdownScrollBehavior]="scrollBehavior()"
      [ngpSelectDropdownShift]="shift()"
      ngpSelect
      data-testid="select"
    >
      <span data-testid="placeholder">Select an option</span>

      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        @for (option of options; track option) {
          <div [ngpSelectOptionValue]="option" ngpSelectOption>{{ option }}</div>
        }
      </div>
    </div>
    <div class="spacer"></div>
  `,
  styles: `
    .spacer {
      height: 600px;
    }

    /* Pin the trigger to the right edge and give the panel a fixed width, so the
       dropdown genuinely overflows the viewport and shift has something to do. */
    [ngpSelect] {
      width: 80px;
      margin-left: auto;
    }

    /* The primitive computes coordinates but leaves positioning to the consumer,
       as the docs examples do - without this the panel stays in normal flow. */
    [ngpSelectDropdown] {
      position: absolute;
      top: 0;
      left: 0;
      width: 300px;
    }
  `,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
})
class TestSelectComponent {
  readonly options = ['Apple', 'Banana', 'Cherry'];
  readonly scrollBehavior = signal<NgpScrollBehavior>('reposition');
  readonly shift = signal<NgpShift>(undefined);
}

describe('select dropdown overlay options', () => {
  afterEach(() => {
    document.querySelectorAll('[ngpSelectDropdown]').forEach(el => el.remove());
    window.scrollTo(0, 0);
  });

  function dropdown(): HTMLElement | null {
    return document.querySelector('[data-testid="dropdown"]');
  }

  async function open(select: HTMLElement): Promise<void> {
    fireEvent.click(select);
    await waitFor(() => expect(dropdown()).toBeInTheDocument());
  }

  it('should default to repositioning on scroll', async () => {
    const { getByTestId } = await render(TestSelectComponent);

    await open(getByTestId('select'));

    expect(document.documentElement.style.position).not.toBe('fixed');
  });

  it('should block page scroll when scrollBehavior is block', async () => {
    const { getByTestId, fixture } = await render(TestSelectComponent);
    fixture.componentInstance.scrollBehavior.set('block');
    fixture.detectChanges();

    await open(getByTestId('select'));

    await waitFor(() => expect(document.documentElement.style.position).toBe('fixed'));

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(document.documentElement.style.position).not.toBe('fixed'));
  });

  it('should close on scroll when scrollBehavior is close', async () => {
    const { getByTestId, fixture } = await render(TestSelectComponent);
    fixture.componentInstance.scrollBehavior.set('close');
    fixture.detectChanges();

    await open(getByTestId('select'));

    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => expect(dropdown()).not.toBeInTheDocument());
  });

  it('should keep an overflowing dropdown within the shift padding', async () => {
    const { getByTestId, fixture } = await render(TestSelectComponent);
    fixture.componentInstance.shift.set({ padding: 24 });
    fixture.detectChanges();

    await open(getByTestId('select'));

    await waitFor(() =>
      expect(dropdown()!.getBoundingClientRect().right).toBeLessThanOrEqual(
        window.innerWidth - 24 + 1,
      ),
    );
  });

  it('should let the dropdown overflow when shift is disabled', async () => {
    const { getByTestId, fixture } = await render(TestSelectComponent);
    fixture.componentInstance.shift.set(false);
    fixture.detectChanges();

    await open(getByTestId('select'));

    await waitFor(() =>
      expect(dropdown()!.getBoundingClientRect().right).toBeGreaterThan(window.innerWidth),
    );
  });
});
