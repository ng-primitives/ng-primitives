import { Component, viewChildren } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NgpAutocompleteDropdown } from '../../autocomplete-dropdown/autocomplete-dropdown';
import { NgpAutocompleteInput } from '../../autocomplete-input/autocomplete-input';
import { NgpAutocompleteOption } from '../../autocomplete-option/autocomplete-option';
import { NgpAutocompletePortal } from '../../autocomplete-portal/autocomplete-portal';
import { NgpAutocomplete } from '../autocomplete';

const INSTANCES = 50;

@Component({
  imports: [
    NgpAutocomplete,
    NgpAutocompleteDropdown,
    NgpAutocompleteInput,
    NgpAutocompleteOption,
    NgpAutocompletePortal,
  ],
  template: `
    @for (field of fields; track field) {
      <div ngpAutocomplete>
        <input ngpAutocompleteInput />
        <div *ngpAutocompletePortal ngpAutocompleteDropdown>
          <div ngpAutocompleteOption ngpAutocompleteOptionValue="Marty">Marty</div>
        </div>
      </div>
    }
  `,
})
class ManyAutocompletesComponent {
  readonly fields = Array.from({ length: INSTANCES }, (_, index) => index);
  readonly autocompletes = viewChildren(NgpAutocomplete);
}

function expectClosed() {
  return waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
}

describe('NgpAutocomplete at scale', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    screen.queryByRole('listbox')?.remove();
  });

  it('should hold no page-wide listener until a dropdown is shown at a measured position', async () => {
    const listen = {
      document: vi.spyOn(document, 'addEventListener'),
      window: vi.spyOn(window, 'addEventListener'),
    };
    const unlisten = {
      document: vi.spyOn(document, 'removeEventListener'),
      window: vi.spyOn(window, 'removeEventListener'),
    };
    const count = (spy: { mock: { calls: unknown[][] } }, type: string) =>
      spy.mock.calls.filter(([eventType]) => eventType === type).length;
    // document scroll and window resize listeners still attached
    const pageListeners = () =>
      count(listen.document, 'scroll') -
      count(unlisten.document, 'scroll') +
      count(listen.window, 'resize') -
      count(unlisten.window, 'resize');

    const { fixture } = await render(ManyAutocompletesComponent);
    const [autocomplete, other] = fixture.componentInstance.autocompletes();
    expect(fixture.componentInstance.autocompletes()).toHaveLength(INSTANCES);
    expect(pageListeners()).toBe(0);

    // a first dropdown sets up the root-level listeners that every overlay shares
    await other.openDropdown();
    await screen.findByRole('listbox');
    other.closeDropdown();
    await expectClosed();
    const shared = pageListeners();
    const measure = vi.fn(() => ({ x: 120, y: 80 }));

    // closed, the position is only measured once the dropdown opens
    autocomplete.setPosition(measure);
    expect(measure).not.toHaveBeenCalled();

    await autocomplete.openDropdown();
    await screen.findByRole('listbox');
    expect(measure).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      document.dispatchEvent(new Event('scroll'));
      expect(measure).toHaveBeenCalledTimes(2);
    });

    autocomplete.closeDropdown();
    await expectClosed();
    await waitFor(() => expect(pageListeners()).toBe(shared));

    document.dispatchEvent(new Event('scroll'));
    expect(measure).toHaveBeenCalledTimes(2);
  });
});
