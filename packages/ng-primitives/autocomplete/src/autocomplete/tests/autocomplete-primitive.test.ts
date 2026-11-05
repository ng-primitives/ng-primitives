import {
  Component,
  Directive,
  TemplateRef,
  ViewContainerRef,
  forwardRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpDialog, NgpDialogContext, NgpDialogManager } from 'ng-primitives/dialog';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NgpAutocompleteButton } from '../../autocomplete-button/autocomplete-button';
import { NgpAutocompleteDropdown } from '../../autocomplete-dropdown/autocomplete-dropdown';
import { NgpAutocompleteInput } from '../../autocomplete-input/autocomplete-input';
import { NgpAutocompleteOption } from '../../autocomplete-option/autocomplete-option';
import { NgpAutocompletePortal } from '../../autocomplete-portal/autocomplete-portal';
import { provideAutocompleteConfig } from '../../config/autocomplete-config';
import { NgpAutocomplete } from '../autocomplete';
import { injectAutocompleteState, NgpAutocompleteStateToken } from '../autocomplete-state';

@Directive({
  selector: '[captureAutocompleteState]',
})
class CaptureAutocompleteStateDirective {
  readonly state = injectAutocompleteState();
}

@Component({
  imports: [
    NgpAutocomplete,
    NgpAutocompleteButton,
    NgpAutocompleteDropdown,
    NgpAutocompleteInput,
    NgpAutocompleteOption,
    NgpAutocompletePortal,
  ],
  template: `
    <div
      [ngpAutocompleteSelectedValue]="value"
      [ngpAutocompleteDisabled]="disabled"
      [ngpAutocompleteMinLength]="minLength"
      [ngpAutocompleteAutoActivate]="autoActivate"
      (ngpAutocompleteSelected)="onSelected($event)"
      (ngpAutocompleteActiveValueChange)="activeValues.push($event)"
      (ngpAutocompleteOpenChange)="onOpenChange($event)"
      data-testid="autocomplete"
      ngpAutocomplete
    >
      <input
        [value]="filter"
        (input)="onFilterChange($event)"
        placeholder="Search a fruit"
        ngpAutocompleteInput
      />

      <button data-testid="autocomplete-button" ngpAutocompleteButton>▼</button>

      <div *ngpAutocompletePortal ngpAutocompleteDropdown>
        @for (option of filteredOptions(); track option) {
          <div [ngpAutocompleteOptionValue]="option" ngpAutocompleteOption>
            {{ option }}
          </div>
        } @empty {
          <div data-testid="empty-message">No options found</div>
        }
      </div>
    </div>
  `,
})
class TestComponent {
  value: string | undefined = undefined;
  disabled = false;
  minLength = 1;
  autoActivate = false;
  readonly activeValues: (string | undefined)[] = [];
  filter = '';
  open = false;
  readonly selections: string[] = [];
  options = ['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry'];

  filteredOptions() {
    return this.filter
      ? this.options.filter(option => option.toLowerCase().includes(this.filter.toLowerCase()))
      : this.options;
  }

  onSelected(value: string) {
    this.selections.push(value);
    this.value = value;
    this.filter = value;
  }

  onFilterChange(event: Event) {
    this.filter = (event.target as HTMLInputElement).value;
  }

  onOpenChange(event: boolean) {
    this.open = event;
  }
}

@Component({
  imports: [
    NgpAutocomplete,
    NgpAutocompleteDropdown,
    NgpAutocompleteInput,
    NgpAutocompleteOption,
    CaptureAutocompleteStateDirective,
  ],
  template: `
    <div captureAutocompleteState ngpAutocomplete>
      <input ngpAutocompleteInput />

      <div ngpAutocompleteDropdown>
        @for (option of filteredOptions(); track option) {
          <div
            [ngpAutocompleteOptionValue]="option"
            [attr.data-testid]="'closed-option-' + option"
            ngpAutocompleteOption
          >
            {{ option }}
          </div>
        }
      </div>
    </div>
  `,
})
class ClosedOptionsAutocompleteComponent {
  readonly autocompleteState = viewChild.required(CaptureAutocompleteStateDirective);
  filter = '';
  options = ['Apple', 'Banana', 'Cherry'];

  filteredOptions() {
    return this.filter
      ? this.options.filter(option => option.toLowerCase().includes(this.filter.toLowerCase()))
      : this.options;
  }
}

/** Records selections without ever setting the selected value. */
@Component({
  imports: [
    NgpAutocomplete,
    NgpAutocompleteButton,
    NgpAutocompleteDropdown,
    NgpAutocompleteInput,
    NgpAutocompleteOption,
    NgpAutocompletePortal,
  ],
  template: `
    <div (ngpAutocompleteSelected)="selections.push($event)" ngpAutocomplete>
      <input ngpAutocompleteInput />
      <button data-testid="autocomplete-button" ngpAutocompleteButton>▼</button>
      <div *ngpAutocompletePortal ngpAutocompleteDropdown>
        <div
          (ngpAutocompleteOptionActivated)="actionActivations = actionActivations + 1"
          ngpAutocompleteOption
        >
          Create a fruit
        </div>
        @for (option of options; track option) {
          <div [ngpAutocompleteOptionValue]="option" ngpAutocompleteOption>
            {{ option }}
          </div>
        }
      </div>
    </div>
  `,
})
class SelectionOnlyComponent {
  readonly selections: string[] = [];
  actionActivations = 0;
  options = ['Apple', 'Banana', 'Cherry'];
}

/** Reopens the dropdown from its own close notification, once. */
@Component({
  imports: [
    NgpAutocomplete,
    NgpAutocompleteDropdown,
    NgpAutocompleteInput,
    NgpAutocompletePortal,
    CaptureAutocompleteStateDirective,
  ],
  template: `
    <div
      (ngpAutocompleteOpenChange)="onOpenChange($event)"
      captureAutocompleteState
      ngpAutocomplete
    >
      <input ngpAutocompleteInput />
      <div *ngpAutocompletePortal ngpAutocompleteDropdown>Options</div>
    </div>
  `,
})
class ReopenOnCloseAutocompleteComponent {
  readonly autocomplete = viewChild.required(CaptureAutocompleteStateDirective);
  readonly changes: boolean[] = [];
  private reopened = false;

  onOpenChange(open: boolean) {
    this.changes.push(open);
    if (!open && !this.reopened) {
      this.reopened = true;
      void this.autocomplete().state().openDropdown();
    }
  }
}

function removeLingeringDropdown() {
  // the dropdown should be removed from the DOM after each test to avoid
  // interference with other tests - it may linger due to waiting for animations
  const dropdown = screen.queryByRole('listbox');
  if (dropdown) {
    dropdown.remove();
  }
}

function keydown(element: HTMLElement, key: string): KeyboardEvent {
  // cancelable, so defaultPrevented reports whether the autocomplete handled the key
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event;
}

describe('NgpAutocomplete', () => {
  afterEach(removeLingeringDropdown);

  it('should initialize correctly', async () => {
    await render(TestComponent);

    const autocompleteInput = screen.getByRole('combobox');
    expect(autocompleteInput).toBeInTheDocument();

    const button = screen.getByTestId('autocomplete-button');
    expect(button).toBeInTheDocument();
  });

  it('should open the dropdown when button is clicked', async () => {
    await render(TestComponent);

    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('should filter options based on input', async () => {
    await render(TestComponent);

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'berr');

    expect(screen.getByText('Elderberry')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('should validate aria-activedescendant when the active option is filtered out while open', async () => {
    const { fixture } = await render(TestComponent);

    const input = screen.getByRole('combobox');
    input.focus();

    await userEvent.keyboard('{arrowdown}');
    await waitFor(() => {
      expect(screen.getByText('Apple')).toHaveAttribute('data-active');
    });

    await userEvent.keyboard('{arrowdown}{arrowdown}');
    await waitFor(() => {
      expect(screen.getByText('Cherry')).toHaveAttribute('data-active');
    });

    const staleId = screen.getByText('Cherry').id;

    fireEvent.input(input, { target: { value: 'App' } });
    fixture.detectChanges();

    await waitFor(() => {
      expect(screen.queryByText('Cherry')).not.toBeInTheDocument();

      const appleOption = screen.getByText('Apple');
      const activeId = input.getAttribute('aria-activedescendant');
      expect(activeId).toBe(appleOption.id);
      expect(document.getElementById(activeId as string)).toBe(appleOption);
    });
    expect(document.getElementById(staleId)).toBeNull();
  });

  it('should clear aria-activedescendant when filtering to no options while open', async () => {
    const { fixture } = await render(TestComponent);

    const input = screen.getByRole('combobox');
    input.focus();

    await userEvent.keyboard('{arrowdown}{arrowdown}');
    await waitFor(() => {
      expect(screen.getByText('Banana')).toHaveAttribute('data-active');
    });

    const staleId = screen.getByText('Banana').id;

    fireEvent.input(input, { target: { value: 'zzz' } });
    fixture.detectChanges();

    await waitFor(() => {
      expect(screen.getByTestId('empty-message')).toBeInTheDocument();
      expect(input).not.toHaveAttribute('aria-activedescendant');
    });
    expect(document.getElementById(staleId)).toBeNull();
  });

  it('should not validate changed options while closed', async () => {
    const { fixture } = await render(ClosedOptionsAutocompleteComponent);
    const component = fixture.componentInstance;
    const state = component.autocompleteState().state();

    expect(state.open()).toBe(false);
    state.activeDescendantManager.activateByIndex(2);
    expect(state.activeDescendantManager.index()).toBe(2);

    component.filter = 'App';
    fixture.detectChanges();
    await fixture.whenStable();

    expect(screen.queryByTestId('closed-option-Cherry')).not.toBeInTheDocument();
    expect(state.open()).toBe(false);
    expect(state.activeDescendantManager.index()).toBe(2);
  });

  it('should display "No options found" when filter has no matches', async () => {
    await render(TestComponent);

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'xyz');

    expect(screen.getByTestId('empty-message')).toBeInTheDocument();
  });

  it('should respect disabled state', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    component.disabled = true;
    fixture.detectChanges();

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();

    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);

    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('should emit open/close events', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);

    expect(component.open).toBeTruthy();

    await userEvent.click(document.body);

    await waitFor(() => {
      expect(component.open).toBeFalsy();
    });
  });

  it('should close dropdown when clicking outside', async () => {
    await render(TestComponent);

    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);

    expect(screen.getByText('Apple')).toBeInTheDocument();

    await userEvent.click(document.body);

    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  it('should close dropdown when pressing Escape key', async () => {
    await render(TestComponent);

    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);

    expect(screen.getByText('Apple')).toBeInTheDocument();

    await userEvent.keyboard('{escape}');

    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  it('should allow typing and filtering in the input', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'Ba');

    expect(component.filter).toBe('Ba');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('should wrap keyboard navigation when reaching end of options', async () => {
    await render(TestComponent);

    const input = screen.getByRole('combobox');
    input.focus();

    await userEvent.keyboard('{arrowdown}');
    await userEvent.keyboard('{arrowdown}{arrowdown}{arrowdown}{arrowdown}{arrowdown}');

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('data-active');

    await userEvent.keyboard('{arrowup}');
    expect(options[options.length - 1]).toHaveAttribute('data-active');
  });

  it('should allow caret navigation with Home and End keys when dropdown is closed', async () => {
    await render(TestComponent);

    const input = screen.getByRole('combobox');
    input.focus();

    // the caret only moves if the default action survives, which holds on every platform
    expect(keydown(input, 'Home').defaultPrevented).toBe(false);
    expect(keydown(input, 'End').defaultPrevented).toBe(false);
  });

  it('should not throw when a synthetic keydown omits key (browser autofill)', async () => {
    await render(TestComponent);
    const input = screen.getByRole('combobox');

    const event = new KeyboardEvent('keydown', { bubbles: true });
    Object.defineProperty(event, 'key', { value: undefined });

    expect(() => input.dispatchEvent(event)).not.toThrow();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  describe('reopening while the dropdown is closing', () => {
    // Keep the dropdown in its exit state until the test ends the animation, so input
    // arrives while the overlay is still on screen. Every call returns the same held
    // animation, so finishExit() settles the exit that started, and afterEach settles an
    // exit a test leaves held.
    let finishExit: () => void;
    const originalGetAnimations = Element.prototype.getAnimations;

    beforeEach(() => {
      const finished = new Promise<void>(resolve => (finishExit = resolve));
      const animation = { finished, cancel: () => finishExit() } as unknown as Animation;
      Element.prototype.getAnimations = function (this: Element) {
        return this.hasAttribute('data-exit') ? [animation] : [];
      };
    });

    afterEach(() => {
      finishExit();
      Element.prototype.getAnimations = originalGetAnimations;
    });

    it('should stay open when an openChange(false) handler reopens it', async () => {
      const { fixture } = await render(ReopenOnCloseAutocompleteComponent);
      const input = screen.getByRole('combobox');

      await userEvent.click(input);
      await userEvent.keyboard('{ArrowDown}');
      const dropdown = await screen.findByRole('listbox');

      await userEvent.keyboard('{Escape}');

      // The reopen cancels the exit rather than letting it run to the end.
      await waitFor(() => expect(dropdown).not.toHaveAttribute('data-exit'));
      finishExit();
      await fixture.whenStable();

      expect(screen.getByRole('listbox')).toBe(dropdown);
      expect(input).toHaveAttribute('aria-expanded', 'true');
      expect(fixture.componentInstance.changes).toEqual([true, false, true]);
    });

    it('should open without waiting a microtask once the exit animation has ended', async () => {
      const { fixture } = await render(TestComponent);
      const state = fixture.debugElement
        .query(By.directive(NgpAutocomplete))
        .injector.get(NgpAutocompleteStateToken)();
      const input = screen.getByRole('combobox');

      await userEvent.click(input);
      await userEvent.keyboard('{ArrowDown}');
      await screen.findByRole('listbox');

      await userEvent.keyboard('{Escape}');
      finishExit();
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
      await fixture.whenStable();

      const opening = state.openDropdown();

      // openChange(true) is emitted synchronously, not after the reopen microtask.
      expect(fixture.componentInstance.open).toBe(true);
      await opening;
    });

    it('should reopen the dropdown when a character is typed during the exit animation', async () => {
      const { fixture } = await render(TestComponent);
      const input = screen.getByRole('combobox');

      await userEvent.click(input);
      await userEvent.keyboard('{ArrowDown}');
      const dropdown = await screen.findByRole('listbox');

      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(dropdown).toHaveAttribute('data-exit'));
      expect(fixture.componentInstance.open).toBe(false);

      await userEvent.keyboard('a');
      finishExit();

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBe(dropdown);
        expect(dropdown).not.toHaveAttribute('data-exit');
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(fixture.componentInstance.open).toBe(true);
      });
      expect(input).toHaveValue('a');
    });

    it('should reopen the dropdown when ArrowDown is pressed during the exit animation', async () => {
      const { fixture } = await render(TestComponent);
      const input = screen.getByRole('combobox');

      await userEvent.click(input);
      await userEvent.keyboard('{ArrowDown}');
      const dropdown = await screen.findByRole('listbox');

      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(dropdown).toHaveAttribute('data-exit'));

      await userEvent.keyboard('{ArrowDown}');
      finishExit();

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBe(dropdown);
        expect(input).toHaveAttribute('aria-expanded', 'true');
        expect(fixture.componentInstance.open).toBe(true);
      });
    });
  });
});

describe('NgpAutocomplete selection', () => {
  afterEach(removeLingeringDropdown);

  it('should emit the value of an option when it is clicked', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    await userEvent.click(screen.getByTestId('autocomplete-button'));
    await userEvent.click(screen.getByText('Banana'));

    expect(component.selections).toEqual(['Banana']);
    expect(component.filter).toBe('Banana');

    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  it('should emit the value of the active option when Enter is pressed', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const input = screen.getByRole('combobox');
    input.focus();

    await userEvent.keyboard('{arrowdown}');
    await waitFor(() => expect(screen.getByText('Apple')).toHaveAttribute('data-active'));

    await userEvent.keyboard('{arrowdown}{arrowdown}');
    await waitFor(() => expect(screen.getByText('Cherry')).toHaveAttribute('data-active'));

    expect(keydown(input, 'Enter').defaultPrevented).toBe(true);
    expect(component.selections).toEqual(['Cherry']);
  });

  it('should emit every selection, even of the option that is already selected', async () => {
    const { fixture } = await render(TestComponent);
    const button = screen.getByTestId('autocomplete-button');

    await userEvent.click(button);
    await userEvent.click(screen.getByText('Banana'));
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

    await userEvent.click(button);
    await userEvent.click(await screen.findByText('Banana'));

    expect(fixture.componentInstance.selections).toEqual(['Banana', 'Banana']);
  });

  it('should leave the selected value to the consumer', async () => {
    const { fixture } = await render(SelectionOnlyComponent);
    const button = screen.getByTestId('autocomplete-button');

    await userEvent.click(button);
    await userEvent.click(screen.getByText('Banana'));
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

    await userEvent.click(button);
    await screen.findByRole('listbox');

    expect(fixture.componentInstance.selections).toEqual(['Banana']);
    for (const option of screen.getAllByRole('option')) {
      expect(option).not.toHaveAttribute('data-selected');
    }
  });

  it('should only emit the activated event of an option without a value', async () => {
    const { fixture } = await render(SelectionOnlyComponent);

    await userEvent.click(screen.getByTestId('autocomplete-button'));
    await userEvent.click(screen.getByText('Create a fruit'));

    expect(fixture.componentInstance.actionActivations).toBe(1);
    expect(fixture.componentInstance.selections).toEqual([]);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('should not activate an option when typing opens the dropdown', async () => {
    const { fixture } = await render(TestComponent);

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'a');
    await screen.findByRole('listbox');

    // narrowing the list does not activate an option either
    await userEvent.type(input, 'n');
    await fixture.whenStable();

    for (const option of screen.getAllByRole('option')) {
      expect(option).not.toHaveAttribute('data-active');
    }
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('should not activate an option when the button opens the dropdown with nothing selected', async () => {
    const { fixture } = await render(TestComponent);

    await userEvent.click(screen.getByTestId('autocomplete-button'));
    await screen.findByRole('listbox');
    await fixture.whenStable();

    for (const option of screen.getAllByRole('option')) {
      expect(option).not.toHaveAttribute('data-active');
    }
  });

  it('should keep the typed text when Enter is pressed with no active option', async () => {
    const { fixture } = await render(TestComponent);

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'Ban');
    await screen.findByRole('listbox');

    // the default action is left to the browser, so Enter can submit an enclosing form
    expect(keydown(input, 'Enter').defaultPrevented).toBe(false);
    expect(fixture.componentInstance.selections).toEqual([]);

    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(input).toHaveValue('Ban');
  });

  it('should not prevent Enter when the dropdown is closed', async () => {
    await render(TestComponent);

    const input = screen.getByRole('combobox');
    input.focus();

    expect(keydown(input, 'Enter').defaultPrevented).toBe(false);
  });

  it('should not restore the text when the dropdown closes', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    await userEvent.click(screen.getByTestId('autocomplete-button'));
    await userEvent.click(screen.getByText('Banana'));
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

    const input = screen.getByRole('combobox');
    await userEvent.clear(input);
    await userEvent.type(input, 'Ch');
    await screen.findByRole('listbox');

    await userEvent.keyboard('{escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

    expect(input).toHaveValue('Ch');
    expect(component.value).toBe('Banana');
  });

  it('should not throw when text that does not match any options is committed with Enter', async () => {
    await render(TestComponent);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'Nonexistent Option');
    expect(async () => await userEvent.keyboard('{enter}')).not.toThrow();
  });
});

describe('NgpAutocomplete selected value', () => {
  afterEach(removeLingeringDropdown);

  it('should mark the option matching the selected value with data-selected', async () => {
    const { fixture } = await render(TestComponent);
    fixture.componentInstance.value = 'Cherry';
    fixture.detectChanges();

    await userEvent.click(screen.getByTestId('autocomplete-button'));
    await screen.findByRole('listbox');

    expect(screen.getByText('Cherry')).toHaveAttribute('data-selected');
    expect(screen.getByText('Apple')).not.toHaveAttribute('data-selected');
  });

  it('should match the selected value with compareWith', async () => {
    @Component({
      imports: [
        NgpAutocomplete,
        NgpAutocompleteButton,
        NgpAutocompleteDropdown,
        NgpAutocompleteInput,
        NgpAutocompleteOption,
        NgpAutocompletePortal,
      ],
      template: `
        <div
          [ngpAutocompleteSelectedValue]="{ id: 2 }"
          [ngpAutocompleteCompareWith]="compareById"
          ngpAutocomplete
        >
          <input ngpAutocompleteInput />
          <button data-testid="autocomplete-button" ngpAutocompleteButton>▼</button>
          <div *ngpAutocompletePortal ngpAutocompleteDropdown>
            @for (fruit of fruits; track fruit.id) {
              <div [ngpAutocompleteOptionValue]="fruit" ngpAutocompleteOption>
                {{ fruit.name }}
              </div>
            }
          </div>
        </div>
      `,
    })
    class CompareWithComponent {
      fruits = [
        { id: 1, name: 'Apple' },
        { id: 2, name: 'Banana' },
      ];
      compareById = (a?: { id: number }, b?: { id: number }) => a?.id === b?.id;
    }

    await render(CompareWithComponent);
    await userEvent.click(screen.getByTestId('autocomplete-button'));
    await screen.findByRole('listbox');

    expect(screen.getByText('Banana')).toHaveAttribute('data-selected');
    expect(screen.getByText('Banana')).toHaveAttribute('data-active');
  });

  it('should activate the selected option when the button opens the dropdown', async () => {
    const { fixture } = await render(TestComponent);
    fixture.componentInstance.value = 'Banana';
    fixture.detectChanges();

    await userEvent.click(screen.getByTestId('autocomplete-button'));

    await waitFor(() => expect(screen.getByText('Banana')).toHaveAttribute('data-active'));
  });

  it('should activate and scroll to the selected option when ArrowDown opens the dropdown', async () => {
    @Component({
      imports: [
        NgpAutocomplete,
        NgpAutocompleteDropdown,
        NgpAutocompleteInput,
        NgpAutocompleteOption,
        NgpAutocompletePortal,
      ],
      template: `
        <div
          [ngpAutocompleteSelectedValue]="'Cherry'"
          [ngpAutocompleteScrollToOption]="scrollTo"
          ngpAutocomplete
        >
          <input ngpAutocompleteInput />
          <div *ngpAutocompletePortal ngpAutocompleteDropdown>
            @for (option of options; track option) {
              <div [ngpAutocompleteOptionValue]="option" ngpAutocompleteOption>
                {{ option }}
              </div>
            }
          </div>
        </div>
      `,
    })
    class SelectedScrollComponent {
      options = ['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry'];
      readonly scrolled: number[] = [];
      scrollTo = (index: number) => this.scrolled.push(index);
    }

    const { fixture, detectChanges } = await render(SelectedScrollComponent);

    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{arrowdown}');

    await waitFor(() => expect(screen.getByText('Cherry')).toHaveAttribute('data-active'));
    detectChanges();
    expect(fixture.componentInstance.scrolled).toEqual([2]);
  });

  it('should not activate the selected option when typing opens the dropdown', async () => {
    const { fixture } = await render(TestComponent);
    fixture.componentInstance.value = 'Cherry';
    fixture.detectChanges();

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'e');
    await screen.findByRole('listbox');
    await fixture.whenStable();

    expect(screen.getByText('Cherry')).toHaveAttribute('data-selected');
    expect(screen.getByText('Cherry')).not.toHaveAttribute('data-active');
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('should move aria-selected with the active option and keep data-selected on the selected one', async () => {
    const { fixture } = await render(TestComponent);
    fixture.componentInstance.value = 'Cherry';
    fixture.detectChanges();

    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{arrowdown}');

    const cherry = screen.getByText('Cherry');
    await waitFor(() => expect(cherry).toHaveAttribute('aria-selected', 'true'));

    await userEvent.keyboard('{arrowdown}');

    expect(screen.getByText('Dragon Fruit')).toHaveAttribute('aria-selected', 'true');
    expect(cherry).not.toHaveAttribute('aria-selected');
    expect(cherry).toHaveAttribute('data-selected');
  });
});

describe('NgpAutocomplete ArrowUp open options and scrolling', () => {
  afterEach(removeLingeringDropdown);

  it('ArrowUp opens dropdown and activates last option', async () => {
    await render(TestComponent);

    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{arrowup}');

    await waitFor(() => {
      const options = screen.getAllByRole('option');
      expect(options[options.length - 1]).toHaveAttribute('data-active');
    });
  });

  it('ArrowUp opens dropdown and preserves selected option', async () => {
    const { fixture } = await render(TestComponent);
    fixture.componentInstance.value = 'Banana';
    fixture.detectChanges();

    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{arrowup}');

    await waitFor(() => {
      expect(screen.getByText('Banana')).toHaveAttribute('data-active');
      expect(screen.getByText('Elderberry')).not.toHaveAttribute('data-active');
    });
  });

  it('ArrowUp scrolls last option into view only once', async () => {
    @Component({
      imports: [
        NgpAutocomplete,
        NgpAutocompleteInput,
        NgpAutocompleteDropdown,
        NgpAutocompleteOption,
        NgpAutocompletePortal,
      ],
      template: `
        <div [ngpAutocompleteScrollToOption]="scrollTo" ngpAutocomplete>
          <input ngpAutocompleteInput />
          <div *ngpAutocompletePortal ngpAutocompleteDropdown>
            @for (option of options; track option) {
              <div [ngpAutocompleteOptionValue]="option" ngpAutocompleteOption>
                {{ option }}
              </div>
            }
          </div>
        </div>
      `,
    })
    class ScrollComponent {
      options = ['Apple', 'Banana', 'Cherry'];
      readonly scrolled: number[] = [];
      scrollTo = (index: number) => this.scrolled.push(index);
    }

    const { fixture, detectChanges } = await render(ScrollComponent);

    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{arrowup}');

    await waitFor(() => expect(fixture.componentInstance.scrolled).toEqual([2]));
    detectChanges();
    expect(fixture.componentInstance.scrolled).toEqual([2]);
  });

  it('ArrowUp on empty dropdown does not scroll or activate', async () => {
    @Component({
      imports: [
        NgpAutocomplete,
        NgpAutocompleteInput,
        NgpAutocompleteDropdown,
        NgpAutocompletePortal,
      ],
      template: `
        <div [ngpAutocompleteScrollToOption]="scrollTo" ngpAutocomplete>
          <input ngpAutocompleteInput />
          <div *ngpAutocompletePortal ngpAutocompleteDropdown>
            <div data-testid="empty">No options</div>
          </div>
        </div>
      `,
    })
    class EmptyDropdownComponent {
      readonly scrolled: number[] = [];
      scrollTo = (index: number) => this.scrolled.push(index);
    }

    const { fixture } = await render(EmptyDropdownComponent);

    const input = screen.getByRole('combobox');
    input.focus();
    await userEvent.keyboard('{arrowup}');

    await screen.findByTestId('empty');
    expect(fixture.componentInstance.scrolled).toEqual([]);
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });
});

describe('NgpAutocompleteOption', () => {
  afterEach(removeLingeringDropdown);

  it('should render custom content inside option', async () => {
    @Component({
      imports: [
        NgpAutocomplete,
        NgpAutocompleteButton,
        NgpAutocompleteDropdown,
        NgpAutocompleteInput,
        NgpAutocompleteOption,
        NgpAutocompletePortal,
      ],
      template: `
        <div ngpAutocomplete>
          <input ngpAutocompleteInput />
          <button ngpAutocompleteButton>▼</button>
          <div *ngpAutocompletePortal ngpAutocompleteDropdown>
            <div [ngpAutocompleteOptionValue]="'Apple'" ngpAutocompleteOption>
              <span data-testid="custom-icon">🍎</span>
              Apple
            </div>
          </div>
        </div>
      `,
    })
    class CustomOptionComponent {}
    await render(CustomOptionComponent);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });
});

describe('NgpAutocompleteInput', () => {
  afterEach(removeLingeringDropdown);

  it('should have appropriate ARIA attributes', async () => {
    const { detectChanges } = await render(TestComponent);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');

    await userEvent.click(screen.getByTestId('autocomplete-button'));
    detectChanges();
    const dropdown = screen.getByRole('listbox');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveAttribute('aria-controls', dropdown.id);

    await userEvent.keyboard('{escape}');
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('should close the dropdown when focus leaves the autocomplete', async () => {
    const { fixture } = await render(TestComponent);
    const input = screen.getByRole('combobox');

    await userEvent.click(input);
    await userEvent.keyboard('a');
    await screen.findByRole('listbox');

    // the button is inside the autocomplete, so the dropdown stays open
    screen.getByTestId('autocomplete-button').focus();
    await fixture.whenStable();
    expect(input).toHaveAttribute('aria-expanded', 'true');

    screen.getByTestId('autocomplete-button').blur();
    await waitFor(() => expect(input).toHaveAttribute('aria-expanded', 'false'));
  });

  it('should keep focus in the input when an option is pressed', async () => {
    const { fixture } = await render(TestComponent);
    const input = screen.getByRole('combobox');

    await userEvent.click(input);
    await userEvent.keyboard('an');
    await userEvent.click(await screen.findByText('Banana'));

    expect(fixture.componentInstance.selections).toEqual(['Banana']);
    expect(input).toHaveFocus();
  });
});

describe('NgpAutocompletePortal', () => {
  afterEach(removeLingeringDropdown);

  it('should render the dropdown in a portal outside the component', async () => {
    await render(TestComponent);
    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);
    const dropdown = screen.getByText('Apple').closest('[ngpautocompletedropdown]');
    expect(dropdown?.parentElement).not.toBe(button.parentElement);
  });

  it('should render the dropdown into the updated container when it changes between opens', async () => {
    @Component({
      imports: [
        NgpAutocomplete,
        NgpAutocompleteButton,
        NgpAutocompleteDropdown,
        NgpAutocompleteInput,
        NgpAutocompleteOption,
        NgpAutocompletePortal,
      ],
      template: `
        <div id="autocomplete-dynamic-a"></div>
        <div id="autocomplete-dynamic-b"></div>

        <div [ngpAutocompleteDropdownContainer]="container()" ngpAutocomplete>
          <input ngpAutocompleteInput />
          <button data-testid="autocomplete-button" ngpAutocompleteButton>▼</button>

          <div *ngpAutocompletePortal ngpAutocompleteDropdown data-testid="autocomplete-dropdown">
            <div ngpAutocompleteOption ngpAutocompleteOptionValue="apple">Apple</div>
          </div>
        </div>
      `,
    })
    class DynamicContainerComponent {
      readonly container = signal<string>('#autocomplete-dynamic-a');
    }

    const { fixture } = await render(DynamicContainerComponent);
    const button = screen.getByTestId('autocomplete-button');

    fireEvent.click(button);
    await waitFor(() => {
      const containerA = document.querySelector('#autocomplete-dynamic-a');
      expect(containerA?.querySelector('[ngpAutocompleteDropdown]')).toBeInTheDocument();
    });

    fireEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByTestId('autocomplete-dropdown')).not.toBeInTheDocument();
    });

    fixture.componentInstance.container.set('#autocomplete-dynamic-b');
    fixture.detectChanges();

    fireEvent.click(button);
    await waitFor(() => {
      const containerB = document.querySelector('#autocomplete-dynamic-b');
      expect(containerB?.querySelector('[ngpAutocompleteDropdown]')).toBeInTheDocument();
    });
  });
});

describe('openChange events', () => {
  afterEach(removeLingeringDropdown);

  it('should emit when clicking outside', async () => {
    const { fixture } = await render(TestComponent);
    const spy = vi.spyOn(fixture.componentInstance, 'onOpenChange');

    await userEvent.click(screen.getByTestId('autocomplete-button'));
    expect(spy).toHaveBeenCalledWith(true);

    await userEvent.click(document.body);
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should emit when pressing Escape key', async () => {
    const { fixture } = await render(TestComponent);
    const spy = vi.spyOn(fixture.componentInstance, 'onOpenChange');

    await userEvent.click(screen.getByTestId('autocomplete-button'));
    expect(spy).toHaveBeenCalledWith(true);

    await userEvent.keyboard('{escape}');
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should emit openChange false when destroyed while open', async () => {
    const { fixture } = await render(TestComponent);
    const spy = vi.spyOn(fixture.componentInstance, 'onOpenChange');

    await userEvent.click(screen.getByTestId('autocomplete-button'));
    expect(spy).toHaveBeenCalledWith(true);
    spy.mockClear();

    fixture.destroy();
    expect(spy).toHaveBeenCalledWith(false);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit when destroyed when already closed', async () => {
    const { fixture } = await render(TestComponent);
    const spy = vi.spyOn(fixture.componentInstance, 'onOpenChange');

    await userEvent.click(screen.getByTestId('autocomplete-button'));
    expect(spy).toHaveBeenCalledWith(true);

    await userEvent.click(document.body);
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(false);
    });

    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockClear();

    fixture.destroy();
    expect(spy).not.toHaveBeenCalled();
  });
});

/**
 * A reusable component that wraps the autocomplete and exposes it as a form control via a
 * ControlValueAccessor. This mirrors how consumers integrate the autocomplete with Angular forms -
 * the NgControl lives on the wrapper element, not on the inner autocomplete primitives.
 */
@Component({
  selector: 'app-autocomplete-with-input',
  imports: [
    NgpAutocomplete,
    NgpAutocompleteButton,
    NgpAutocompleteDropdown,
    NgpAutocompleteInput,
    NgpAutocompletePortal,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteWithInputWrapper),
      multi: true,
    },
  ],
  template: `
    <div
      [ngpAutocompleteSelectedValue]="value()"
      (ngpAutocompleteSelected)="value.set($event)"
      ngpAutocomplete
      data-testid="autocomplete"
    >
      <input ngpAutocompleteInput data-testid="autocomplete-input" />
      <button ngpAutocompleteButton>▼</button>
      <div *ngpAutocompletePortal ngpAutocompleteDropdown></div>
    </div>
  `,
})
class AutocompleteWithInputWrapper implements ControlValueAccessor {
  readonly value = signal<string | undefined>(undefined);
  writeValue(value: string | undefined): void {
    this.value.set(value);
  }
  registerOnChange(): void {}
  registerOnTouched(): void {}
}

describe('NgpAutocomplete form control status', () => {
  @Component({
    imports: [AutocompleteWithInputWrapper, ReactiveFormsModule],
    template: `
      <app-autocomplete-with-input [formControl]="control" />
    `,
  })
  class WithInputHost {
    readonly control = new FormControl('', Validators.required);
  }

  it('should apply data-invalid to the autocomplete when the form control is invalid', async () => {
    await render(WithInputHost);

    const autocomplete = screen.getByTestId('autocomplete');
    expect(autocomplete).toHaveAttribute('data-invalid');
    expect(autocomplete).not.toHaveAttribute('data-valid');
  });

  it('should apply data-valid to the autocomplete when the form control is valid', async () => {
    const { fixture } = await render(WithInputHost);
    fixture.componentInstance.control.setValue('a value');
    fixture.detectChanges();

    const autocomplete = screen.getByTestId('autocomplete');
    expect(autocomplete).toHaveAttribute('data-valid');
    expect(autocomplete).not.toHaveAttribute('data-invalid');
  });
});

@Component({
  imports: [
    NgpAutocomplete,
    NgpAutocompleteDropdown,
    NgpAutocompleteInput,
    NgpAutocompleteOption,
    NgpAutocompletePortal,
    NgpDialog,
  ],
  template: `
    <ng-template #dialogTemplate>
      <div ngpDialog data-testid="dialog">
        <div ngpAutocomplete>
          <input
            [value]="filter"
            (input)="onFilterChange($event)"
            data-testid="dialog-autocomplete-input"
            ngpAutocompleteInput
          />

          <div *ngpAutocompletePortal ngpAutocompleteDropdown>
            @for (option of filteredOptions(); track option) {
              <div [ngpAutocompleteOptionValue]="option" ngpAutocompleteOption>
                {{ option }}
              </div>
            }
          </div>
        </div>
      </div>
    </ng-template>
  `,
})
class AutocompleteInsideDialogComponent {
  readonly dialogTemplate = viewChild.required<TemplateRef<NgpDialogContext>>('dialogTemplate');
  readonly viewContainerRef = inject(ViewContainerRef);
  filter = '';
  options = ['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry'];

  filteredOptions() {
    return this.filter
      ? this.options.filter(option => option.toLowerCase().includes(this.filter.toLowerCase()))
      : this.options;
  }

  onFilterChange(event: Event) {
    this.filter = (event.target as HTMLInputElement).value;
  }
}

describe('NgpAutocomplete inside NgpDialog', () => {
  let dialogManager: NgpDialogManager | undefined;
  let activeFixture: ComponentFixture<AutocompleteInsideDialogComponent> | undefined;

  afterEach(async () => {
    // Close any open dialogs and wait until their elements are actually
    // removed from the DOM. The dialog manager attaches portals to the root
    // ApplicationRef view container (not the test fixture), so destroying the
    // fixture alone does not detach the dialog DOM.
    dialogManager?.closeAll();
    await waitFor(() => expect(document.querySelector('[ngpdialog]')).toBeNull());
    activeFixture?.destroy();
    activeFixture = undefined;
  });

  async function openDialogWithAutocomplete() {
    const { fixture } = await render(AutocompleteInsideDialogComponent);
    activeFixture = fixture;
    dialogManager = TestBed.inject(NgpDialogManager);
    const component = fixture.componentInstance;
    dialogManager.open(component.dialogTemplate(), {
      viewContainerRef: component.viewContainerRef,
    });
    fixture.detectChanges();
    return { fixture, component };
  }

  it('should keep focus on the input when its dropdown opens outside the dialog', async () => {
    await openDialogWithAutocomplete();

    const input = (await screen.findByTestId('dialog-autocomplete-input')) as HTMLInputElement;
    await userEvent.type(input, 'a');

    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());
    expect(document.activeElement).toBe(input);
  });

  it('should let the user type into the autocomplete input inside the dialog', async () => {
    await openDialogWithAutocomplete();

    const input = (await screen.findByTestId('dialog-autocomplete-input')) as HTMLInputElement;
    await userEvent.type(input, 'App');

    expect(input.value).toBe('App');
    await waitFor(() => expect(screen.getByText('Apple')).toBeInTheDocument());
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });
});

describe('NgpAutocomplete opening', () => {
  afterEach(removeLingeringDropdown);

  it('should not open while the text is shorter than the minimum length', async () => {
    const { fixture } = await render(TestComponent);
    fixture.componentInstance.minLength = 2;
    fixture.detectChanges();

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'a');
    await fixture.whenStable();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await userEvent.type(input, 'p');
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  it('should close when deleting below the minimum length', async () => {
    await render(TestComponent);

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'a');
    await screen.findByRole('listbox');

    await userEvent.keyboard('{Backspace}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('should not open when Backspace is pressed in an empty input', async () => {
    const { fixture } = await render(TestComponent);

    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{Backspace}');
    await fixture.whenStable();

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should open with ArrowDown whatever the minimum length', async () => {
    const { fixture } = await render(TestComponent);
    fixture.componentInstance.minLength = 3;
    fixture.detectChanges();

    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{arrowdown}');

    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  it('should take the default minimum length from the global configuration', async () => {
    @Component({
      imports: [
        NgpAutocomplete,
        NgpAutocompleteDropdown,
        NgpAutocompleteInput,
        NgpAutocompleteOption,
        NgpAutocompletePortal,
      ],
      providers: [provideAutocompleteConfig({ minLength: 2 })],
      template: `
        <div ngpAutocomplete>
          <input ngpAutocompleteInput />
          <div *ngpAutocompletePortal ngpAutocompleteDropdown>
            <div ngpAutocompleteOption ngpAutocompleteOptionValue="Apple">Apple</div>
          </div>
        </div>
      `,
    })
    class ConfiguredComponent {}

    const { fixture } = await render(ConfiguredComponent);
    const input = screen.getByRole('combobox');

    await userEvent.type(input, 'a');
    await fixture.whenStable();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    await userEvent.type(input, 'p');
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
  });

  it('should clear the active option when the user types', async () => {
    const { fixture } = await render(TestComponent);

    const input = screen.getByRole('combobox');
    input.focus();
    await userEvent.keyboard('{arrowdown}{arrowdown}');
    await waitFor(() => expect(screen.getByText('Banana')).toHaveAttribute('data-active'));

    await userEvent.keyboard('a');
    await fixture.whenStable();

    for (const option of screen.getAllByRole('option')) {
      expect(option).not.toHaveAttribute('data-active');
    }
    expect(input).not.toHaveAttribute('aria-activedescendant');
  });

  it('should leave Home and End to the caret while the dropdown is open', async () => {
    await render(TestComponent);

    const input = screen.getByRole('combobox');
    input.focus();
    await userEvent.keyboard('{arrowdown}{arrowdown}');
    await waitFor(() => expect(screen.getByText('Banana')).toHaveAttribute('data-active'));

    expect(keydown(input, 'Home').defaultPrevented).toBe(false);
    expect(keydown(input, 'End').defaultPrevented).toBe(false);
    expect(screen.getByText('Banana')).toHaveAttribute('data-active');
  });

  it('should leave Escape to the page while the dropdown is closed', async () => {
    await render(TestComponent);

    const input = screen.getByRole('combobox');
    input.focus();

    expect(keydown(input, 'Escape').defaultPrevented).toBe(false);
  });

  it('should not make the container focusable', async () => {
    await render(TestComponent);

    expect(screen.getByTestId('autocomplete')).not.toHaveAttribute('tabindex');
  });
});

describe('NgpAutocomplete auto activation', () => {
  afterEach(removeLingeringDropdown);

  it('should activate the first option while typing', async () => {
    const { fixture } = await render(TestComponent);
    fixture.componentInstance.autoActivate = true;
    fixture.detectChanges();

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'e');

    // Apple, Cherry and Elderberry contain an "e"
    await waitFor(() => expect(screen.getByText('Apple')).toHaveAttribute('data-active'));

    await userEvent.type(input, 'r');
    await waitFor(() => expect(screen.getByText('Cherry')).toHaveAttribute('data-active'));

    expect(keydown(input, 'Enter').defaultPrevented).toBe(true);
    expect(fixture.componentInstance.selections).toEqual(['Cherry']);
  });

  it('should activate the first option rather than the selected one while typing', async () => {
    const { fixture } = await render(TestComponent);
    fixture.componentInstance.autoActivate = true;
    fixture.componentInstance.value = 'Cherry';
    fixture.detectChanges();

    await userEvent.type(screen.getByRole('combobox'), 'e');

    await waitFor(() => expect(screen.getByText('Apple')).toHaveAttribute('data-active'));
    expect(screen.getByText('Cherry')).not.toHaveAttribute('data-active');
  });

  it('should emit the value of the active option as it changes', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    screen.getByRole('combobox').focus();
    await userEvent.keyboard('{arrowdown}');
    await waitFor(() => expect(component.activeValues).toEqual(['Apple']));

    await userEvent.keyboard('{arrowdown}');
    await waitFor(() => expect(component.activeValues).toEqual(['Apple', 'Banana']));

    await userEvent.keyboard('{escape}');
    await waitFor(() => expect(component.activeValues).toEqual(['Apple', 'Banana', undefined]));
  });
});
