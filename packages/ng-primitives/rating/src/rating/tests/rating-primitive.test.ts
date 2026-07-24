import { Directive } from '@angular/core';
import { fireEvent, render } from '@testing-library/angular';
import { injectRatingItemState, NgpRating, NgpRatingItem } from 'ng-primitives/rating';
import { describe, expect, it, vi } from 'vitest';

/** Probe that injects the item state from within a rendered item view. */
@Directive({ selector: '[probeItemState]', exportAs: 'probeItemState' })
class ProbeItemState {
  readonly state = injectRatingItemState();
}

/**
 * The stars are rendered by the `*ngpRatingItem` structural directive. The test
 * template binds the render context onto data attributes so we can assert the
 * derived per-item state (checked / half / fraction / highlighted).
 */
function createTemplate(extraProps = ''): string {
  return `
    <div
      ngpRating
      data-testid="rating"
      (ngpRatingValueChange)="valueChange($event)"
      ${extraProps}>
      <span
        *ngpRatingItem="let star"
        class="star"
        [attr.data-index]="star.index"
        [attr.data-fraction]="star.fraction">
      </span>
    </div>
  `;
}

const imports = [NgpRating, NgpRatingItem];

async function renderRating(extraProps = '', props: Record<string, unknown> = {}) {
  const valueChange = vi.fn();
  const view = await render(createTemplate(extraProps), {
    imports,
    componentProperties: { valueChange, ...props },
  });
  const rating = view.getByTestId('rating');
  const stars = () => Array.from(view.container.querySelectorAll<HTMLElement>('.star'));
  return { ...view, valueChange, rating, stars };
}

/** Give a star element a predictable box so pointer maths is deterministic. */
function mockBox(el: HTMLElement, left = 0, width = 20): void {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    left,
    top: 0,
    right: left + width,
    bottom: 20,
    width,
    height: 20,
    x: left,
    y: 0,
    toJSON: () => ({}),
  });
}

describe('NgpRating', () => {
  describe('slider semantics', () => {
    it('exposes the slider role with value range on the root', async () => {
      const { rating } = await renderRating(`[ngpRatingValue]="3" [ngpRatingCount]="5"`);

      expect(rating).toHaveAttribute('role', 'slider');
      expect(rating).toHaveAttribute('aria-valuemin', '0');
      expect(rating).toHaveAttribute('aria-valuemax', '5');
      expect(rating).toHaveAttribute('aria-valuenow', '3');
      expect(rating).toHaveAttribute('aria-valuetext');
      expect(rating).toHaveAttribute('tabindex', '0');
    });

    it('renders one item per count', async () => {
      const { stars } = await renderRating(`[ngpRatingValue]="0" [ngpRatingCount]="5"`);
      expect(stars()).toHaveLength(5);
    });

    it('reacts to a changing count', async () => {
      const { stars, rerender, fixture } = await renderRating(
        `[ngpRatingValue]="0" [ngpRatingCount]="count"`,
        { count: 5 },
      );
      expect(stars()).toHaveLength(5);

      await rerender({ componentProperties: { count: 3, valueChange: vi.fn() } });
      fixture.detectChanges();
      expect(stars()).toHaveLength(3);
    });
  });

  describe('item state derivation', () => {
    it('marks filled stars checked for a whole value', async () => {
      const { stars } = await renderRating(`[ngpRatingValue]="3" [ngpRatingCount]="5"`);
      const filled = stars().map(s => s.hasAttribute('data-checked'));
      expect(filled).toEqual([true, true, true, false, false]);
    });

    it('marks the boundary star half when allowHalf and value is x.5', async () => {
      const { stars } = await renderRating(
        `[ngpRatingValue]="2.5" [ngpRatingCount]="5" ngpRatingAllowHalf`,
      );
      // stars 1,2 full; star 3 half; 4,5 empty
      expect(stars().map(s => s.hasAttribute('data-checked'))).toEqual([
        true,
        true,
        false,
        false,
        false,
      ]);
      expect(stars().map(s => s.hasAttribute('data-half'))).toEqual([
        false,
        false,
        true,
        false,
        false,
      ]);
    });

    it('exposes a 0-1 fraction per star for fractional (readonly average) values', async () => {
      const { stars } = await renderRating(
        `[ngpRatingValue]="3.7" [ngpRatingCount]="5" ngpRatingReadonly`,
      );
      const fractions = stars().map(s => Number(s.getAttribute('data-fraction')));
      // first three fully filled, fourth 70%, fifth empty
      expect(fractions[0]).toBe(1);
      expect(fractions[2]).toBe(1);
      expect(fractions[3]).toBeCloseTo(0.7);
      expect(fractions[4]).toBe(0);
    });

    it('provides the item state for injection within the item view', async () => {
      const { container } = await render(
        `
        <div ngpRating [ngpRatingValue]="3" [ngpRatingCount]="5">
          <span
            *ngpRatingItem="let star"
            class="star"
            probeItemState
            #probe="probeItemState"
            [attr.data-injected-checked]="probe.state().checked ? '' : null">
          </span>
        </div>
      `,
        { imports: [NgpRating, NgpRatingItem, ProbeItemState] },
      );

      const injected = Array.from(container.querySelectorAll<HTMLElement>('.star')).map(s =>
        s.hasAttribute('data-injected-checked'),
      );
      // value 3 => first three stars report checked via the injected state
      expect(injected).toEqual([true, true, true, false, false]);
    });
  });

  describe('pointer', () => {
    it('sets the value when a star is clicked', async () => {
      const { stars, valueChange, rating } = await renderRating(
        `[ngpRatingDefaultValue]="0" [ngpRatingCount]="5"`,
      );
      fireEvent.click(stars()[2]);
      expect(valueChange).toHaveBeenCalledWith(3);
      expect(rating).toHaveAttribute('aria-valuenow', '3');
    });

    it('clears to 0 when clicking the currently selected star (clearable)', async () => {
      const { stars, valueChange } = await renderRating(
        `[ngpRatingValue]="3" [ngpRatingCount]="5" [ngpRatingClearable]="true"`,
      );
      fireEvent.click(stars()[2]); // star index 3 == current value
      expect(valueChange).toHaveBeenLastCalledWith(0);
    });

    it('does not clear when clicking the selected star by default', async () => {
      const { stars, valueChange } = await renderRating(
        `[ngpRatingValue]="3" [ngpRatingCount]="5"`,
      );
      fireEvent.click(stars()[2]); // star index 3 == current value
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('selects a half value from the left half of a star when allowHalf', async () => {
      const { stars, valueChange } = await renderRating(
        `[ngpRatingValue]="0" [ngpRatingCount]="5" ngpRatingAllowHalf`,
      );
      const third = stars()[2];
      mockBox(third, 40, 20); // occupies x 40..60
      fireEvent.pointerMove(third, { clientX: 45 }); // left half
      fireEvent.click(third, { clientX: 45 });
      expect(valueChange).toHaveBeenLastCalledWith(2.5);
    });

    it('previews the hovered value without committing it', async () => {
      const { stars, rating, valueChange } = await renderRating(
        `[ngpRatingValue]="1" [ngpRatingCount]="5"`,
      );
      const fourth = stars()[3];
      mockBox(fourth, 60, 20);
      fireEvent.pointerMove(fourth, { clientX: 70 });

      // preview: stars 1-4 highlighted, value/aria untouched
      expect(
        stars()
          .slice(0, 4)
          .every(s => s.hasAttribute('data-highlighted')),
      ).toBe(true);
      expect(rating).toHaveAttribute('aria-valuenow', '1');
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('restores the committed value on pointer leave', async () => {
      const { stars, rating } = await renderRating(`[ngpRatingValue]="1" [ngpRatingCount]="5"`);
      const fourth = stars()[3];
      mockBox(fourth, 60, 20);
      fireEvent.pointerMove(fourth, { clientX: 70 });
      fireEvent.pointerLeave(rating);

      expect(stars().some(s => s.hasAttribute('data-highlighted'))).toBe(false);
      // only the first star reflects the committed value of 1
      expect(stars().map(s => s.hasAttribute('data-checked'))).toEqual([
        true,
        false,
        false,
        false,
        false,
      ]);
    });
  });

  describe('keyboard', () => {
    it('increments on ArrowRight/ArrowUp and decrements on ArrowLeft/ArrowDown', async () => {
      const { rating, valueChange } = await renderRating(
        `[ngpRatingDefaultValue]="2" [ngpRatingCount]="5"`,
      );
      fireEvent.keyDown(rating, { key: 'ArrowRight' });
      expect(valueChange).toHaveBeenLastCalledWith(3);
      fireEvent.keyDown(rating, { key: 'ArrowLeft' });
      expect(valueChange).toHaveBeenLastCalledWith(2);
      fireEvent.keyDown(rating, { key: 'ArrowUp' });
      expect(valueChange).toHaveBeenLastCalledWith(3);
      fireEvent.keyDown(rating, { key: 'ArrowDown' });
      expect(valueChange).toHaveBeenLastCalledWith(2);
    });

    it('steps by 0.5 when allowHalf', async () => {
      const { rating, valueChange } = await renderRating(
        `[ngpRatingValue]="2" [ngpRatingCount]="5" ngpRatingAllowHalf`,
      );
      fireEvent.keyDown(rating, { key: 'ArrowRight' });
      expect(valueChange).toHaveBeenLastCalledWith(2.5);
    });

    it('goes to 0 on Home when clearable and fills to count on End', async () => {
      const { rating, valueChange } = await renderRating(
        `[ngpRatingValue]="2" [ngpRatingCount]="5" [ngpRatingClearable]="true"`,
      );
      fireEvent.keyDown(rating, { key: 'Home' });
      expect(valueChange).toHaveBeenLastCalledWith(0);
      fireEvent.keyDown(rating, { key: 'End' });
      expect(valueChange).toHaveBeenLastCalledWith(5);
    });

    it('does not go below 0 or above count', async () => {
      const { rating, valueChange } = await renderRating(
        `[ngpRatingValue]="0" [ngpRatingCount]="5"`,
      );
      fireEvent.keyDown(rating, { key: 'ArrowLeft' });
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('inverts arrow direction in RTL', async () => {
      const { rating, valueChange } = await renderRating(
        `dir="rtl" [ngpRatingDefaultValue]="2" [ngpRatingCount]="5"`,
      );
      fireEvent.keyDown(rating, { key: 'ArrowLeft' });
      expect(valueChange).toHaveBeenLastCalledWith(3);
      fireEvent.keyDown(rating, { key: 'ArrowRight' });
      expect(valueChange).toHaveBeenLastCalledWith(2);
    });
  });

  describe('deselection (clearable)', () => {
    it('does not clear when clicking the selected star if not clearable', async () => {
      const { stars, valueChange, rating } = await renderRating(
        `[ngpRatingValue]="3" [ngpRatingCount]="5" [ngpRatingClearable]="false"`,
      );
      fireEvent.click(stars()[2]); // star 3 == current value
      expect(valueChange).not.toHaveBeenCalled();
      expect(rating).toHaveAttribute('aria-valuenow', '3');
    });

    it('still selects a different star when not clearable', async () => {
      const { stars, valueChange } = await renderRating(
        `[ngpRatingValue]="3" [ngpRatingCount]="5" [ngpRatingClearable]="false"`,
      );
      fireEvent.click(stars()[4]);
      expect(valueChange).toHaveBeenLastCalledWith(5);
    });

    it('does not decrease below 1 with the keyboard when not clearable', async () => {
      const { rating, valueChange } = await renderRating(
        `[ngpRatingValue]="1" [ngpRatingCount]="5" [ngpRatingClearable]="false"`,
      );
      fireEvent.keyDown(rating, { key: 'ArrowDown' });
      expect(valueChange).not.toHaveBeenCalled();
      expect(rating).toHaveAttribute('aria-valuenow', '1');
    });

    it('moves to 1 (not 0) on Home when not clearable', async () => {
      const { rating, valueChange } = await renderRating(
        `[ngpRatingDefaultValue]="3" [ngpRatingCount]="5" [ngpRatingClearable]="false"`,
      );
      fireEvent.keyDown(rating, { key: 'Home' });
      expect(valueChange).toHaveBeenLastCalledWith(1);
      expect(rating).toHaveAttribute('aria-valuenow', '1');
    });

    it('clears on re-select and Home when clearable is enabled', async () => {
      const { stars, rating, valueChange } = await renderRating(
        `[ngpRatingDefaultValue]="3" [ngpRatingCount]="5" [ngpRatingClearable]="true"`,
      );
      fireEvent.click(stars()[2]);
      expect(valueChange).toHaveBeenLastCalledWith(0);
      fireEvent.keyDown(rating, { key: 'Home' });
      // already 0 after the click; Home keeps it at 0 (no new emit)
      expect(rating).toHaveAttribute('aria-valuenow', '0');
    });
  });

  describe('disabled and readonly', () => {
    it('is inert and unfocusable when disabled', async () => {
      const { rating, stars, valueChange } = await renderRating(
        `[ngpRatingValue]="2" [ngpRatingCount]="5" ngpRatingDisabled`,
      );
      expect(rating).toHaveAttribute('tabindex', '-1');
      expect(rating).toHaveAttribute('data-disabled', '');

      fireEvent.click(stars()[4]);
      fireEvent.keyDown(rating, { key: 'ArrowRight' });
      expect(valueChange).not.toHaveBeenCalled();
    });

    it('stays focusable but non-editable when readonly', async () => {
      const { rating, stars, valueChange } = await renderRating(
        `[ngpRatingValue]="2" [ngpRatingCount]="5" ngpRatingReadonly`,
      );
      expect(rating).toHaveAttribute('tabindex', '0');
      expect(rating).toHaveAttribute('aria-readonly', 'true');
      expect(rating).toHaveAttribute('data-readonly', '');

      fireEvent.click(stars()[4]);
      fireEvent.keyDown(rating, { key: 'ArrowRight' });
      expect(valueChange).not.toHaveBeenCalled();
    });
  });

  describe('controlled mode', () => {
    it('should emit valueChange but not update the DOM when the parent does not update the binding', async () => {
      const { rating, valueChange } = await renderRating('[ngpRatingValue]="value"', { value: 2 });
      expect(rating).toHaveAttribute('aria-valuenow', '2');

      // Keyboard interaction notifies via valueChange, but because the parent
      // never writes the value back, the controlled value must stay put.
      fireEvent.keyDown(rating, { key: 'ArrowUp' });

      expect(valueChange).toHaveBeenCalledWith(3);
      expect(rating).toHaveAttribute('aria-valuenow', '2');
    });

    it('should update the DOM when a controlled value changes via two-way binding', async () => {
      const { rating } = await renderRating('[(ngpRatingValue)]="value"', { value: 2 });

      fireEvent.keyDown(rating, { key: 'ArrowUp' });
      expect(rating).toHaveAttribute('aria-valuenow', '3');
    });
  });

  describe('defaultValue (uncontrolled)', () => {
    it('should start from the default value', async () => {
      const { rating } = await renderRating('[ngpRatingDefaultValue]="2"');
      expect(rating).toHaveAttribute('aria-valuenow', '2');
    });

    it('should let keyboard interaction override the default value (uncontrolled)', async () => {
      const { rating } = await renderRating('[ngpRatingDefaultValue]="2"');
      fireEvent.keyDown(rating, { key: 'ArrowUp' });
      expect(rating).toHaveAttribute('aria-valuenow', '3');
    });

    it('should prefer a controlled value over the default value when both are provided', async () => {
      const { rating } = await renderRating('[ngpRatingValue]="1" [ngpRatingDefaultValue]="4"');
      expect(rating).toHaveAttribute('aria-valuenow', '1');
    });

    it('should fall back to the declared default when defaultValue is explicitly undefined', async () => {
      const { rating } = await renderRating('[ngpRatingDefaultValue]="value"', {
        value: undefined,
      });
      // a bound-undefined default must resolve to the declared default (0), not NaN
      expect(rating).toHaveAttribute('aria-valuenow', '0');
    });
  });
});
