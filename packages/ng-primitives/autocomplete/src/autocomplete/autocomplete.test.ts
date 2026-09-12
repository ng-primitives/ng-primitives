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
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpDialog, NgpDialogContext, NgpDialogManager } from 'ng-primitives/dialog';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { NgpAutocompleteButton } from '../autocomplete-button/autocomplete-button';
import { NgpAutocompleteDropdown } from '../autocomplete-dropdown/autocomplete-dropdown';
import { NgpAutocompleteInput } from '../autocomplete-input/autocomplete-input';
import { NgpAutocompleteOption } from '../autocomplete-option/autocomplete-option';
import { NgpAutocompletePortal } from '../autocomplete-portal/autocomplete-portal';
import { NgpAutocomplete } from './autocomplete';
import { injectAutocompleteState } from './autocomplete-state';

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
      [ngpAutocompleteValue]="value"
      [ngpAutocompleteDisabled]="disabled"
      (ngpAutocompleteValueChange)="onValueChange($event)"
      (ngpAutocompleteOpenChange)="onOpenChange($event)"
      ngpAutocomplete
    >
      <input
        [value]="filter"
        (input)="onFilterChange($event)"
        placeholder="Select an option"
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
  filter = '';
  open = false;
  options = ['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry'];

  filteredOptions() {
    return this.filter
      ? this.options.filter(option => option.toLowerCase().includes(this.filter.toLowerCase()))
      : this.options;
  }

  onValueChange(value: string) {
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
      [ngpAutocompleteValue]="value"
      [ngpAutocompleteMultiple]="true"
      (ngpAutocompleteValueChange)="onValueChange($event)"
      (ngpAutocompleteOpenChange)="onOpenChange($event)"
      ngpAutocomplete
    >
      <input
        [value]="filter"
        (input)="onFilterChange($event)"
        placeholder="Select options"
        ngpAutocompleteInput
      />

      <button data-testid="multi-autocomplete-button" ngpAutocompleteButton>▼</button>

      <div *ngpAutocompletePortal ngpAutocompleteDropdown>
        @for (option of filteredOptions(); track option) {
          <div [ngpAutocompleteOptionValue]="option" ngpAutocompleteOption>
            {{ option }}
          </div>
        }
      </div>
    </div>
  `,
})
class MultiSelectTestComponent {
  value: string[] = [];
  filter = '';
  options = ['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry'];

  filteredOptions() {
    return this.filter
      ? this.options.filter(option => option.toLowerCase().includes(this.filter.toLowerCase()))
      : this.options;
  }

  onValueChange(values: string[]) {
    this.value = values;
  }

  onFilterChange(event: Event) {
    this.filter = (event.target as HTMLInputElement).value;
  }

  onOpenChange(_event: boolean) {}
}

describe('NgpAutocomplete', () => {
  afterEach(() => {
    // the dropdown should be removed from the DOM after each test
    // to avoid interference with other tests - it may linger due to waiting for animations
    const dropdown = screen.queryByRole('listbox');
    if (dropdown) {
      dropdown.remove();
    }
  });

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

    // Check if options are visible
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('should select an option when clicked', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);

    const option = screen.getByText('Banana');
    await userEvent.click(option);

    expect(component.value).toBe('Banana');
    expect(component.filter).toBe('Banana');

    // Dropdown should close after selection
    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  it('should filter options based on input', async () => {
    await render(TestComponent);

    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'berr');

    // Only Elderberry should be visible
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

    // Dropdown should not open when disabled
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('should support keyboard navigation', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const input = screen.getByRole('combobox');
    input.focus();

    // Open with arrow down
    await userEvent.keyboard('{arrowdown}');

    // First option should be highlighted
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('data-active');

    // Move to second option
    await userEvent.keyboard('{arrowdown}');
    expect(options[1]).toHaveAttribute('data-active');

    // Select with Enter
    await userEvent.keyboard('{enter}');
    expect(component.value).toBe('Banana');
  });

  it('should emit open/close events', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);

    // Dropdown should be open
    expect(component.open).toBeTruthy();

    // Click outside
    await userEvent.click(document.body);

    // Dropdown should be closed
    await waitFor(() => {
      expect(component.open).toBeFalsy();
    });
  });

  it('should close dropdown when clicking outside', async () => {
    await render(TestComponent);

    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);

    // Dropdown should be open
    expect(screen.getByText('Apple')).toBeInTheDocument();

    // Click outside
    await userEvent.click(document.body);

    // Dropdown should be closed
    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  it('should close dropdown when pressing Escape key', async () => {
    await render(TestComponent);

    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);

    // Dropdown should be open
    expect(screen.getByText('Apple')).toBeInTheDocument();

    // Press Escape
    await userEvent.keyboard('{escape}');

    // Dropdown should be closed
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

    // Dropdown should be open
    const dropdown = screen.getByRole('listbox');
    expect(dropdown).toBeInTheDocument();

    // Only Banana should be visible
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('should navigate options with keyboard up/down and select with Enter', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const input = screen.getByRole('combobox');
    input.focus();

    // Open dropdown with arrow down
    await userEvent.keyboard('{arrowdown}');

    // Navigate to Banana (second option)
    await userEvent.keyboard('{arrowdown}');

    // Navigate to Cherry (third option)
    await userEvent.keyboard('{arrowdown}');

    // Select Cherry with Enter
    await userEvent.keyboard('{enter}');

    expect(component.value).toBe('Cherry');
  });

  it('should wrap keyboard navigation when reaching end of options', async () => {
    await render(TestComponent);

    const input = screen.getByRole('combobox');
    input.focus();

    // Open dropdown with arrow down
    await userEvent.keyboard('{arrowdown}');

    // Navigate down through all options
    await userEvent.keyboard('{arrowdown}');
    await userEvent.keyboard('{arrowdown}');
    await userEvent.keyboard('{arrowdown}');
    await userEvent.keyboard('{arrowdown}');
    await userEvent.keyboard('{arrowdown}');

    // Should wrap to first option
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('data-active');

    // Navigate up should go to last option
    await userEvent.keyboard('{arrowup}');
    expect(options[options.length - 1]).toHaveAttribute('data-active');
  });

  it('should apply active state to the currently selected option', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    // Set initial value
    component.value = 'Banana';
    fixture.detectChanges();

    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);
    fixture.detectChanges();

    // Banana option should have active state
    const bananaOption = screen.getByText('Banana');
    expect(bananaOption).toHaveAttribute('data-active');
  });
});

describe('NgpAutocomplete Multi-select', () => {
  afterEach(() => {
    // the dropdown should be removed from the DOM after each test
    // to avoid interference with other tests - it may linger due to waiting for animations
    const dropdown = screen.queryByRole('listbox');
    if (dropdown) {
      dropdown.remove();
    }
  });

  it('should allow multiple selections', async () => {
    const { fixture } = await render(MultiSelectTestComponent);
    const component = fixture.componentInstance;
    const button = screen.getByTestId('multi-autocomplete-button');
    await userEvent.click(button);
    // Select first option
    await userEvent.click(screen.getByText('Apple'));
    expect(component.value).toEqual(['Apple']);
    // Dropdown should stay open after selection
    expect(screen.getByText('Banana')).toBeInTheDocument();
    // Select second option
    await userEvent.click(screen.getByText('Banana'));
    expect(component.value).toEqual(['Apple', 'Banana']);
  });

  it('should toggle selections when clicking on already selected options', async () => {
    const { fixture } = await render(MultiSelectTestComponent);
    const component = fixture.componentInstance;
    // Start with pre-selected options
    component.value = ['Apple', 'Cherry'];
    fixture.detectChanges();
    const button = screen.getByTestId('multi-autocomplete-button');
    await userEvent.click(button);
    // Apple should be marked as selected
    const appleOption = screen.getByText('Apple').closest('[ngpautocompleteoption]');
    expect(appleOption).toHaveAttribute('data-active');
    // Toggle off Apple
    await userEvent.click(screen.getByText('Apple'));
    expect(component.value).toEqual(['Cherry']);
    // Toggle on Banana
    await userEvent.click(screen.getByText('Banana'));
    expect(component.value).toEqual(['Cherry', 'Banana']);
  });

  it('should support keyboard navigation with multi-select', async () => {
    const { fixture } = await render(MultiSelectTestComponent);
    const component = fixture.componentInstance;
    const input = screen.getByRole('combobox');
    input.focus();
    // Open dropdown with arrow down
    await userEvent.keyboard('{arrowdown}');
    // Navigate to second option
    await userEvent.keyboard('{arrowdown}');
    // Select with enter
    await userEvent.keyboard('{enter}');
    expect(component.value).toContain('Banana');
    // Dropdown should remain open
    expect(screen.getByText('Apple')).toBeInTheDocument();
    // Navigate to first option
    await userEvent.keyboard('{arrowup}');
    // Select with enter
    await userEvent.keyboard('{enter}');
    expect(component.value).toContain('Apple');
    expect(component.value).toHaveLength(2);
  });

  it('should close multi-select dropdown with Escape key', async () => {
    await render(MultiSelectTestComponent);
    const input = screen.getByRole('combobox');
    input.focus();
    // Open dropdown with arrow down
    await userEvent.keyboard('{arrowdown}');
    // Dropdown should be open
    expect(screen.getByText('Apple')).toBeInTheDocument();
    // Press Escape
    await userEvent.keyboard('{escape}');
    // Dropdown should be closed
    await waitFor(() => {
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });
  });

  it('should deselect an already selected option when pressing Enter key', async () => {
    const { fixture } = await render(MultiSelectTestComponent);
    const component = fixture.componentInstance;
    const input = screen.getByRole('combobox');
    input.focus();
    // Open dropdown with arrow down
    await userEvent.keyboard('{arrowdown}');
    // Select first option (Apple) with enter
    await userEvent.keyboard('{enter}');
    expect(component.value).toEqual(['Apple']);
    // Dropdown should remain open
    expect(screen.getByText('Apple')).toBeInTheDocument();
    // Press Enter again to deselect
    await userEvent.keyboard('{enter}');
    // Value should be empty now that Apple is deselected
    expect(component.value).toEqual([]);
    // Dropdown should remain open
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });
});

describe('NgpAutocompleteOption', () => {
  afterEach(() => {
    // the dropdown should be removed from the DOM after each test
    // to avoid interference with other tests - it may linger due to waiting for animations
    const dropdown = screen.queryByRole('listbox');
    if (dropdown) {
      dropdown.remove();
    }
  });

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
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });
});

describe('NgpAutocompleteInput', () => {
  afterEach(() => {
    // the dropdown should be removed from the DOM after each test
    // to avoid interference with other tests - it may linger due to waiting for animations
    const dropdown = screen.queryByRole('listbox');
    if (dropdown) {
      dropdown.remove();
    }
  });

  it('should not throw when text in entered that does not match any options and committed with enter', async () => {
    await render(TestComponent);
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'Nonexistent Option');
    expect(async () => await userEvent.keyboard('{enter}')).not.toThrow();
  });

  it('should have appropriate ARIA attributes', async () => {
    const { detectChanges } = await render(TestComponent);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    // Open dropdown
    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);
    detectChanges();
    const dropdown = screen.getByRole('listbox');
    expect(dropdown).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'true');
    // Close dropdown
    await userEvent.keyboard('{escape}');
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'false');
    });
  });
});

describe('NgpAutocompletePortal', () => {
  afterEach(() => {
    // the dropdown should be removed from the DOM after each test
    // to avoid interference with other tests - it may linger due to waiting for animations
    const dropdown = screen.queryByRole('listbox');
    if (dropdown) {
      dropdown.remove();
    }
  });

  it('should render the dropdown in a portal outside the component', async () => {
    await render(TestComponent);
    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);
    // The dropdown should be rendered outside the immediate parent
    const dropdown = screen.getByText('Apple').closest('[ngpautocompletedropdown]');
    expect(dropdown?.parentElement).not.toBe(button.parentElement);
  });
});

describe('NgpAutocomplete without input', () => {
  @Component({
    imports: [
      NgpAutocomplete,
      NgpAutocompleteButton,
      NgpAutocompleteDropdown,
      NgpAutocompleteOption,
      NgpAutocompletePortal,
    ],
    template: `
      <div
        [ngpAutocompleteValue]="value"
        (ngpAutocompleteValueChange)="onValueChange($event)"
        (ngpAutocompleteOpenChange)="onOpenChange($event)"
        ngpAutocomplete
        data-testid="autocomplete-without-input"
      >
        <button data-testid="autocomplete-button" ngpAutocompleteButton>
          {{ value || 'Select an option' }} ▼
        </button>

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
  class NoInputTestComponent {
    value: string | undefined = undefined;
    open = false;
    options = ['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry'];

    onValueChange(value: string) {
      this.value = value;
    }

    onOpenChange(event: boolean) {
      this.open = event;
    }
  }

  afterEach(() => {
    const dropdown = screen.queryByRole('listbox');
    if (dropdown) {
      dropdown.remove();
    }
  });

  it('should have proper tabindex when no input is present', async () => {
    await render(NoInputTestComponent);
    const autocomplete = screen.getByTestId('autocomplete-without-input');
    expect(autocomplete).toHaveAttribute('tabindex', '0');
  });

  it('should handle keyboard navigation without input', async () => {
    const { fixture } = await render(NoInputTestComponent);
    const component = fixture.componentInstance;
    const autocomplete = screen.getByTestId('autocomplete-without-input');
    const button = screen.getByTestId('autocomplete-button');

    autocomplete.focus();

    // Open with arrow down
    await userEvent.keyboard('{arrowdown}');

    // Check dropdown is open via aria-expanded
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    // First option should be highlighted
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('data-active');

    // Navigate to second option
    await userEvent.keyboard('{arrowdown}');
    expect(options[1]).toHaveAttribute('data-active');

    // Select with Enter
    await userEvent.keyboard('{enter}');

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
    expect(component.value).toBe('Banana');
  });

  it('should close dropdown with Escape key', async () => {
    await render(NoInputTestComponent);
    const autocomplete = screen.getByTestId('autocomplete-without-input');
    const button = screen.getByTestId('autocomplete-button');

    autocomplete.focus();
    await userEvent.keyboard('{arrowdown}');

    // Wait for dropdown to open
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    await userEvent.keyboard('{escape}');

    // Check dropdown is closed via aria-expanded
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('should have tabindex -1 when disabled', async () => {
    @Component({
      imports: [
        NgpAutocomplete,
        NgpAutocompleteButton,
        NgpAutocompleteDropdown,
        NgpAutocompleteOption,
        NgpAutocompletePortal,
      ],
      template: `
        <div [ngpAutocompleteDisabled]="true" ngpAutocomplete data-testid="disabled-autocomplete">
          <button ngpAutocompleteButton>Select</button>
          <div *ngpAutocompletePortal ngpAutocompleteDropdown>
            <div [ngpAutocompleteOptionValue]="'test'" ngpAutocompleteOption>Test</div>
          </div>
        </div>
      `,
    })
    class DisabledAutocompleteComponent {}

    await render(DisabledAutocompleteComponent);
    const autocomplete = screen.getByTestId('disabled-autocomplete');
    expect(autocomplete).toHaveAttribute('tabindex', '-1');
  });

  it('should open the dropdown when pressing Space on focused autocomplete without input', async () => {
    await render(NoInputTestComponent);

    const autocomplete = screen.getByTestId('autocomplete-without-input');
    const button = screen.getByTestId('autocomplete-button');

    autocomplete.focus();
    // Open with spacebar - should open dropdown
    await userEvent.keyboard(' ');

    // Wait for dropdown to open
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    // Check if options are visible
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });
});

describe('openChange events', () => {
  afterEach(() => {
    const dropdown = screen.queryByRole('listbox');
    if (dropdown) {
      dropdown.remove();
    }
  });

  it('should emit when clicking outside', async () => {
    const { fixture } = await render(TestComponent);
    const spy = vi.spyOn(fixture.componentInstance, 'onOpenChange');

    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);
    expect(spy).toHaveBeenCalledWith(true);

    // Click outside to close
    await userEvent.click(document.body);
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should emit when pressing Escape key', async () => {
    const { fixture } = await render(TestComponent);
    const spy = vi.spyOn(fixture.componentInstance, 'onOpenChange');

    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);
    expect(spy).toHaveBeenCalledWith(true);

    // Press Escape to close
    await userEvent.keyboard('{escape}');
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('should emit openChange false when destroyed while open', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;
    const spy = vi.spyOn(component, 'onOpenChange');

    // Open the autocomplete
    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);
    expect(spy).toHaveBeenCalledWith(true);
    spy.mockClear();

    // Destroy while open — should emit false
    fixture.destroy();
    expect(spy).toHaveBeenCalledWith(false);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not emit when destroyed when already closed', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;
    const spy = vi.spyOn(component, 'onOpenChange');

    // Open the autocomplete
    const button = screen.getByTestId('autocomplete-button');
    await userEvent.click(button);
    expect(spy).toHaveBeenCalledWith(true);

    // Close the autocomplete
    await userEvent.click(document.body);
    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(false);
    });

    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockClear();

    // Destroy the component — should NOT emit openChange
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
      [ngpAutocompleteValue]="value()"
      (ngpAutocompleteValueChange)="value.set($event)"
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

/**
 * The same as above, but without an `ngpAutocompleteInput`. The autocomplete host itself is the focusable
 * element. The control status must still be reflected on the autocomplete element.
 */
@Component({
  selector: 'app-autocomplete-without-input',
  imports: [NgpAutocomplete, NgpAutocompleteButton, NgpAutocompleteDropdown, NgpAutocompletePortal],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteWithoutInputWrapper),
      multi: true,
    },
  ],
  template: `
    <div
      [ngpAutocompleteValue]="value()"
      (ngpAutocompleteValueChange)="value.set($event)"
      ngpAutocomplete
      data-testid="autocomplete"
    >
      <button ngpAutocompleteButton>▼</button>
      <div *ngpAutocompletePortal ngpAutocompleteDropdown></div>
    </div>
  `,
})
class AutocompleteWithoutInputWrapper implements ControlValueAccessor {
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

  @Component({
    imports: [AutocompleteWithoutInputWrapper, ReactiveFormsModule],
    template: `
      <app-autocomplete-without-input [formControl]="control" />
    `,
  })
  class WithoutInputHost {
    readonly control = new FormControl('', Validators.required);
  }

  it('should apply data-invalid to the autocomplete when the form control is invalid', async () => {
    await render(WithInputHost);

    const autocomplete = screen.getByTestId('autocomplete');
    expect(autocomplete).toHaveAttribute('data-invalid');
    expect(autocomplete).not.toHaveAttribute('data-valid');
  });

  it('should apply data-invalid to the autocomplete without an input when the form control is invalid', async () => {
    await render(WithoutInputHost);

    const autocomplete = screen.getByTestId('autocomplete');
    expect(autocomplete).toHaveAttribute('data-invalid');
    expect(autocomplete).not.toHaveAttribute('data-valid');
  });

  it('should apply data-valid to the autocomplete without an input when the form control is valid', async () => {
    const { fixture } = await render(WithoutInputHost);
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
    NgpAutocompleteButton,
    NgpAutocompleteDropdown,
    NgpAutocompleteInput,
    NgpAutocompleteOption,
    NgpAutocompletePortal,
    NgpDialog,
  ],
  template: `
    <ng-template #dialogTemplate>
      <div ngpDialog data-testid="dialog">
        <div
          [ngpAutocompleteValue]="value"
          (ngpAutocompleteValueChange)="onValueChange($event)"
          ngpAutocomplete
        >
          <button data-testid="dialog-autocomplete-button" ngpAutocompleteButton>
            {{ value || 'Select' }}
          </button>

          <div *ngpAutocompletePortal ngpAutocompleteDropdown>
            <input
              [value]="filter"
              (input)="onFilterChange($event)"
              data-testid="dialog-autocomplete-input"
              ngpAutocompleteInput
            />
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
  value: string | undefined = undefined;
  filter = '';
  options = ['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry'];

  filteredOptions() {
    return this.filter
      ? this.options.filter(option => option.toLowerCase().includes(this.filter.toLowerCase()))
      : this.options;
  }

  onValueChange(value: string) {
    this.value = value;
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

  it("should not yank focus from the autocomplete input inside the dialog's dropdown", async () => {
    await openDialogWithAutocomplete();

    // Open the autocomplete dropdown inside the dialog
    const trigger = screen.getByTestId('dialog-autocomplete-button');
    await userEvent.click(trigger);

    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());

    // Focus the search input inside the portaled dropdown.
    const input = screen.getByTestId('dialog-autocomplete-input') as HTMLInputElement;
    input.focus();

    expect(document.activeElement).toBe(input);
  });

  it('should let the user type into the autocomplete input inside the dialog', async () => {
    await openDialogWithAutocomplete();

    const trigger = screen.getByTestId('dialog-autocomplete-button');
    await userEvent.click(trigger);

    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument());

    const input = screen.getByTestId('dialog-autocomplete-input') as HTMLInputElement;
    input.focus();

    expect(document.activeElement).toBe(input);

    fireEvent.input(input, { target: { value: 'App' } });

    expect(input.value).toBe('App');
  });
});
