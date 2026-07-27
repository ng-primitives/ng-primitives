import { Component, signal } from '@angular/core';
import { fireEvent, render, waitFor } from '@testing-library/angular';
import {
  NgpOverlay,
  NgpOverlayOption,
  NgpScrollBehavior,
  NgpShift,
  resolveOverlayOption,
} from 'ng-primitives/portal';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal } from '../../index';

@Component({
  template: `
    <div class="spacer-top"></div>
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
    <div class="spacer-bottom"></div>
  `,
  styles: `
    .spacer-top {
      height: 20vh;
    }

    .spacer-bottom {
      height: 300vh;
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

type OverlayContext = {
  config: {
    scrollBehavior?: NgpOverlayOption<NgpScrollBehavior>;
    triggerElement: HTMLElement;
  };
};

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

  /**
   * Read the scroll behaviour the dropdown's overlay was built with. `block` is checked
   * here rather than through its effect, because that effect is inline styles on `<html>`
   * which any other suite sharing the browser page can disturb.
   */
  async function openAndReadScrollBehavior(
    behaviour: NgpScrollBehavior,
  ): Promise<NgpScrollBehavior | undefined> {
    const spy = vi.spyOn(
      NgpOverlay.prototype as unknown as Record<string, () => Promise<void>>,
      'computePosition',
    );

    try {
      const { getByTestId, fixture } = await render(TestSelectComponent);
      fixture.componentInstance.scrollBehavior.set(behaviour);
      fixture.detectChanges();

      const trigger = getByTestId('select');
      await open(trigger);

      // Match the trigger by identity: earlier renders in this suite leave their own
      // `data-testid="select"` elements behind, and their overlays carry the old value.
      const context = (spy.mock.contexts as OverlayContext[]).find(
        c => c?.config?.triggerElement === trigger,
      );
      expect(context).toBeDefined();

      return resolveOverlayOption(context!.config.scrollBehavior);
    } finally {
      spy.mockRestore();
    }
  }

  it('should default to repositioning on scroll', async () => {
    const { getByTestId } = await render(TestSelectComponent);

    await open(getByTestId('select'));

    window.dispatchEvent(new Event('scroll'));
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(dropdown()).toBeInTheDocument();
  });

  // One render per test: TestBed cannot be reconfigured once instantiated.
  it('should pass a block scroll behaviour to the overlay', async () => {
    expect(await openAndReadScrollBehavior('block')).toBe('block');
  });

  it('should pass a reposition scroll behaviour to the overlay', async () => {
    expect(await openAndReadScrollBehavior('reposition')).toBe('reposition');
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
