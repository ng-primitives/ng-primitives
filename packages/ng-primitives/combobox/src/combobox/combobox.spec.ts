import { Component } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpComboboxButton } from '../combobox-button/combobox-button';
import { NgpComboboxDropdown } from '../combobox-dropdown/combobox-dropdown';
import { NgpComboboxInput } from '../combobox-input/combobox-input';
import { NgpComboboxOption } from '../combobox-option/combobox-option';
import { NgpComboboxPortal } from '../combobox-portal/combobox-portal';
import { NgpCombobox } from './combobox';

@Component({
  imports: [
    NgpCombobox,
    NgpComboboxButton,
    NgpComboboxDropdown,
    NgpComboboxInput,
    NgpComboboxOption,
    NgpComboboxPortal,
  ],
  template: `
    <div
      [ngpComboboxValue]="value"
      [ngpComboboxDisabled]="disabled"
      (ngpComboboxValueChange)="onValueChange($event)"
      (ngpComboboxOpenChange)="onOpenChange($event)"
      ngpCombobox
    >
      <input
        [value]="filter"
        (input)="onFilterChange($event)"
        placeholder="Select an option"
        ngpComboboxInput
      />

      <button data-testid="combobox-button" ngpComboboxButton>▼</button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        @for (option of filteredOptions(); track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
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
    NgpCombobox,
    NgpComboboxButton,
    NgpComboboxDropdown,
    NgpComboboxInput,
    NgpComboboxOption,
    NgpComboboxPortal,
  ],
  template: `
    <div
      [ngpComboboxValue]="value"
      [ngpComboboxMultiple]="true"
      (ngpComboboxValueChange)="onValueChange($event)"
      ngpCombobox
    >
      <input
        [value]="filter"
        (input)="onFilterChange($event)"
        placeholder="Select options"
        ngpComboboxInput
      />

      <button data-testid="multi-combobox-button" ngpComboboxButton>▼</button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        @for (option of filteredOptions(); track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
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
}

describe('NgpCombobox', () => {
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

    const comboboxInput = screen.getByRole('combobox');
    expect(comboboxInput).toBeInTheDocument();

    const button = screen.getByTestId('combobox-button');
    expect(button).toBeInTheDocument();
  });

  it('should open the dropdown when button is clicked', async () => {
    await render(TestComponent);

    const button = screen.getByTestId('combobox-button');
    await userEvent.click(button);

    // Check if options are visible
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('should select an option when clicked', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const button = screen.getByTestId('combobox-button');
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

    const button = screen.getByTestId('combobox-button');
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

    const button = screen.getByTestId('combobox-button');
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

    const button = screen.getByTestId('combobox-button');
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

    const button = screen.getByTestId('combobox-button');
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

    const button = screen.getByTestId('combobox-button');
    await userEvent.click(button);
    fixture.detectChanges();

    // Banana option should have active state
    const bananaOption = screen.getByText('Banana');
    expect(bananaOption).toHaveAttribute('data-active');
  });
});

describe('NgpCombobox Multi-select', () => {
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
    const button = screen.getByTestId('multi-combobox-button');
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
    const button = screen.getByTestId('multi-combobox-button');
    await userEvent.click(button);
    // Apple should be marked as selected
    const appleOption = screen.getByText('Apple').closest('[ngpcomboboxoption]');
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
});

describe('NgpComboboxOption', () => {
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
        NgpCombobox,
        NgpComboboxButton,
        NgpComboboxDropdown,
        NgpComboboxInput,
        NgpComboboxOption,
        NgpComboboxPortal,
      ],
      template: `
        <div ngpCombobox>
          <input ngpComboboxInput />
          <button ngpComboboxButton>▼</button>
          <div *ngpComboboxPortal ngpComboboxDropdown>
            <div [ngpComboboxOptionValue]="'Apple'" ngpComboboxOption>
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

describe('NgpComboboxInput', () => {
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
    const button = screen.getByTestId('combobox-button');
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

describe('NgpComboboxPortal', () => {
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
    const button = screen.getByTestId('combobox-button');
    await userEvent.click(button);
    // The dropdown should be rendered outside the immediate parent
    const dropdown = screen.getByText('Apple').closest('[ngpcomboboxdropdown]');
    expect(dropdown?.parentElement).not.toBe(button.parentElement);
  });
});

@Component({
  imports: [
    NgpCombobox,
    NgpComboboxButton,
    NgpComboboxDropdown,
    NgpComboboxInput,
    NgpComboboxOption,
    NgpComboboxPortal,
  ],
  template: `
    <div
      [ngpComboboxValue]="value"
      [ngpComboboxMultiple]="true"
      (ngpComboboxValueChange)="onValueChange($event)"
      ngpCombobox
    >
      <input
        [value]="filter"
        (input)="onFilterChange($event)"
        placeholder="Select options"
        ngpComboboxInput
      />

      <button data-testid="select-all-combobox-button" ngpComboboxButton>▼</button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        <div [ngpComboboxOptionValue]="'all'" ngpComboboxOption>Select All</div>
        @for (option of filteredOptions(); track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
            {{ option }}
          </div>
        }
      </div>
    </div>
  `,
})
class SelectAllTestComponent {
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
}

describe('NgpCombobox Select All', () => {
  afterEach(() => {
    // the dropdown should be removed from the DOM after each test
    // to avoid interference with other tests - it may linger due to waiting for animations
    const dropdown = screen.queryByRole('listbox');
    if (dropdown) {
      dropdown.remove();
    }
  });

  it('should display "Select All" option', async () => {
    await render(SelectAllTestComponent);

    const button = screen.getByTestId('select-all-combobox-button');
    await userEvent.click(button);

    expect(screen.getByText('Select All')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('should select all options when "Select All" is clicked', async () => {
    const { fixture } = await render(SelectAllTestComponent);
    const component = fixture.componentInstance;

    const button = screen.getByTestId('select-all-combobox-button');
    await userEvent.click(button);

    const selectAllOption = screen.getByText('Select All');
    await userEvent.click(selectAllOption);

    expect(component.value).toEqual(['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry']);
  });

  it('should deselect all options when "Select All" is clicked while all are selected', async () => {
    const { fixture } = await render(SelectAllTestComponent);
    const component = fixture.componentInstance;

    // Pre-select all options
    component.value = ['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry'];
    fixture.detectChanges();

    const button = screen.getByTestId('select-all-combobox-button');
    await userEvent.click(button);

    const selectAllOption = screen.getByText('Select All');
    expect(selectAllOption).toHaveAttribute('data-selected');

    await userEvent.click(selectAllOption);

    expect(component.value).toEqual([]);
  });

  it('should show "Select All" as selected when all individual options are selected', async () => {
    const { fixture } = await render(SelectAllTestComponent);
    const component = fixture.componentInstance;

    const button = screen.getByTestId('select-all-combobox-button');
    await userEvent.click(button);

    // Select all options individually
    await userEvent.click(screen.getByText('Apple'));
    await userEvent.click(screen.getByText('Banana'));
    await userEvent.click(screen.getByText('Cherry'));
    await userEvent.click(screen.getByText('Dragon Fruit'));
    await userEvent.click(screen.getByText('Elderberry'));

    expect(component.value).toEqual(['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry']);

    // "Select All" should show as selected
    const selectAllOption = screen.getByText('Select All');
    expect(selectAllOption).toHaveAttribute('data-selected');
  });

  it('should not show "Select All" as selected when only some options are selected', async () => {
    const { fixture } = await render(SelectAllTestComponent);
    const component = fixture.componentInstance;

    const button = screen.getByTestId('select-all-combobox-button');
    await userEvent.click(button);

    // Select only some options
    await userEvent.click(screen.getByText('Apple'));
    await userEvent.click(screen.getByText('Banana'));

    expect(component.value).toEqual(['Apple', 'Banana']);

    // "Select All" should not show as selected
    const selectAllOption = screen.getByText('Select All');
    expect(selectAllOption).not.toHaveAttribute('data-selected');
  });

  it('should work with keyboard navigation', async () => {
    const { fixture } = await render(SelectAllTestComponent);
    const component = fixture.componentInstance;

    const input = screen.getByRole('combobox');
    input.focus();

    // Open dropdown with arrow down
    await userEvent.keyboard('{arrowdown}');

    // First option should be "Select All"
    const selectAllOption = screen.getByText('Select All');
    expect(selectAllOption).toHaveAttribute('data-active');

    // Select with Enter
    await userEvent.keyboard('{enter}');
    expect(component.value).toEqual(['Apple', 'Banana', 'Cherry', 'Dragon Fruit', 'Elderberry']);
  });

  it('should handle filtering correctly with "Select All"', async () => {
    const { fixture } = await render(SelectAllTestComponent);
    const component = fixture.componentInstance;

    // First open the dropdown
    const button = screen.getByTestId('select-all-combobox-button');
    await userEvent.click(button);

    // Then type in the filter
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'Berr');

    // Need to trigger change detection after filtering
    fixture.detectChanges();
    await waitFor(() => {
      // Only filtered options and Select All should be visible
      expect(screen.getByText('Select All')).toBeInTheDocument();
      expect(screen.getByText('Elderberry')).toBeInTheDocument();
      expect(screen.queryByText('Apple')).not.toBeInTheDocument();
    });

    const selectAllOption = screen.getByText('Select All');
    await userEvent.click(selectAllOption);

    // Should select only the visible (filtered) options
    expect(component.value).toEqual(['Elderberry']);
  });

  it('should not allow "Select All" in single selection mode', async () => {
    @Component({
      imports: [
        NgpCombobox,
        NgpComboboxButton,
        NgpComboboxDropdown,
        NgpComboboxInput,
        NgpComboboxOption,
        NgpComboboxPortal,
      ],
      template: `
        <div
          [ngpComboboxValue]="value"
          [ngpComboboxMultiple]="false"
          (ngpComboboxValueChange)="onValueChange($event)"
          ngpCombobox
        >
          <input ngpComboboxInput />
          <button data-testid="single-select-button" ngpComboboxButton>▼</button>
          <div *ngpComboboxPortal ngpComboboxDropdown>
            <div [ngpComboboxOptionValue]="'all'" ngpComboboxOption>Select All</div>
            <div [ngpComboboxOptionValue]="'Apple'" ngpComboboxOption>Apple</div>
          </div>
        </div>
      `,
    })
    class SingleSelectWithSelectAllComponent {
      value: string | undefined = undefined;

      onValueChange(value: string) {
        this.value = value;
      }
    }

    const { fixture } = await render(SingleSelectWithSelectAllComponent);
    const component = fixture.componentInstance;

    const button = screen.getByTestId('single-select-button');
    await userEvent.click(button);

    const selectAllOption = screen.getByText('Select All');
    await userEvent.click(selectAllOption);

    // In single selection mode, "Select All" should not work
    expect(component.value).toBeUndefined();
  });

  it('should handle empty options list gracefully', async () => {
    @Component({
      imports: [
        NgpCombobox,
        NgpComboboxButton,
        NgpComboboxDropdown,
        NgpComboboxInput,
        NgpComboboxOption,
        NgpComboboxPortal,
      ],
      template: `
        <div
          [ngpComboboxValue]="value"
          [ngpComboboxMultiple]="true"
          (ngpComboboxValueChange)="onValueChange($event)"
          ngpCombobox
        >
          <input ngpComboboxInput />
          <button data-testid="empty-options-button" ngpComboboxButton>▼</button>
          <div *ngpComboboxPortal ngpComboboxDropdown>
            <div [ngpComboboxOptionValue]="'all'" ngpComboboxOption>Select All</div>
          </div>
        </div>
      `,
    })
    class EmptyOptionsComponent {
      value: string[] = [];

      onValueChange(values: string[]) {
        this.value = values;
      }
    }

    const { fixture } = await render(EmptyOptionsComponent);
    const component = fixture.componentInstance;

    const button = screen.getByTestId('empty-options-button');
    await userEvent.click(button);

    const selectAllOption = screen.getByText('Select All');
    await userEvent.click(selectAllOption);

    // Should handle empty options gracefully
    expect(component.value).toEqual([]);
  });
});

describe('NgpComboboxOption without value', () => {
  afterEach(() => {
    const dropdown = screen.queryByRole('listbox');
    if (dropdown) {
      dropdown.remove();
    }
  });

  it('should allow options without values', async () => {
    @Component({
      imports: [
        NgpCombobox,
        NgpComboboxButton,
        NgpComboboxDropdown,
        NgpComboboxInput,
        NgpComboboxOption,
        NgpComboboxPortal,
      ],
      template: `
        <div ngpCombobox>
          <input ngpComboboxInput />
          <button data-testid="no-value-button" ngpComboboxButton>▼</button>
          <div *ngpComboboxPortal ngpComboboxDropdown>
            <div ngpComboboxOption>Option without value</div>
            <div [ngpComboboxOptionValue]="'Apple'" ngpComboboxOption>Apple</div>
          </div>
        </div>
      `,
    })
    class NoValueOptionComponent {}

    await render(NoValueOptionComponent);

    const button = screen.getByTestId('no-value-button');
    await userEvent.click(button);

    // Should not throw an error when rendering option without value
    expect(screen.getByText('Option without value')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();

    // Clicking option without value should not select anything
    const noValueOption = screen.getByText('Option without value');
    await userEvent.click(noValueOption);

    // Should not throw an error
  });
});

describe('NgpCombobox without input', () => {
  @Component({
    imports: [
      NgpCombobox,
      NgpComboboxButton,
      NgpComboboxDropdown,
      NgpComboboxOption,
      NgpComboboxPortal,
    ],
    template: `
      <div
        [ngpComboboxValue]="value"
        (ngpComboboxValueChange)="onValueChange($event)"
        (ngpComboboxOpenChange)="onOpenChange($event)"
        ngpCombobox
        data-testid="combobox-without-input"
      >
        <button data-testid="combobox-button" ngpComboboxButton>
          {{ value || 'Select an option' }} ▼
        </button>

        <div *ngpComboboxPortal ngpComboboxDropdown>
          @for (option of options; track option) {
            <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
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
    const combobox = screen.getByTestId('combobox-without-input');
    expect(combobox).toHaveAttribute('tabindex', '0');
  });

  it('should focus combobox element when focus() is called without input', async () => {
    await render(NoInputTestComponent);
    const combobox = screen.getByTestId('combobox-without-input');
    combobox.focus();
    expect(document.activeElement).toBe(combobox);
  });

  it('should handle keyboard navigation without input', async () => {
    const { fixture } = await render(NoInputTestComponent);
    const component = fixture.componentInstance;
    const combobox = screen.getByTestId('combobox-without-input');
    const button = screen.getByTestId('combobox-button');

    combobox.focus();

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

  it('should open dropdown with arrow up and select last item', async () => {
    await render(NoInputTestComponent);
    const combobox = screen.getByTestId('combobox-without-input');
    const button = screen.getByTestId('combobox-button');

    combobox.focus();

    // Open with arrow up - should open and select last item
    await userEvent.keyboard('{arrowup}');

    // Wait for dropdown to open
    await waitFor(() => {
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    const options = screen.getAllByRole('option');
    expect(options[options.length - 1]).toHaveAttribute('data-active');
  });

  it('should navigate to first item with Home key', async () => {
    await render(NoInputTestComponent);
    const combobox = screen.getByTestId('combobox-without-input');

    combobox.focus();
    await userEvent.keyboard('{arrowdown}');

    // Navigate to middle
    await userEvent.keyboard('{arrowdown}');
    await userEvent.keyboard('{arrowdown}');

    // Press Home
    await userEvent.keyboard('{Home}');

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('data-active');
  });

  it('should navigate to last item with End key', async () => {
    await render(NoInputTestComponent);
    const combobox = screen.getByTestId('combobox-without-input');

    combobox.focus();
    await userEvent.keyboard('{arrowdown}');

    // Press End
    await userEvent.keyboard('{End}');

    const options = screen.getAllByRole('option');
    expect(options[options.length - 1]).toHaveAttribute('data-active');
  });

  it('should close dropdown with Escape key', async () => {
    await render(NoInputTestComponent);
    const combobox = screen.getByTestId('combobox-without-input');
    const button = screen.getByTestId('combobox-button');

    combobox.focus();
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

  it('should handle blur events correctly without input', async () => {
    const { fixture } = await render(NoInputTestComponent);
    const component = fixture.componentInstance;
    const combobox = screen.getByTestId('combobox-without-input');

    combobox.focus();
    await userEvent.keyboard('{arrowdown}');
    expect(component.open).toBeTruthy();

    // Blur by clicking outside
    await userEvent.click(document.body);

    await waitFor(() => {
      expect(component.open).toBeFalsy();
    });
  });

  it('should not close dropdown when focus moves to button', async () => {
    const { fixture } = await render(NoInputTestComponent);
    const component = fixture.componentInstance;
    const combobox = screen.getByTestId('combobox-without-input');
    const button = screen.getByTestId('combobox-button');

    combobox.focus();
    await userEvent.keyboard('{arrowdown}');
    expect(component.open).toBeTruthy();

    // Focus button - dropdown should stay open
    button.focus();
    fixture.detectChanges();

    // Give it a moment to process the blur/focus events
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(component.open).toBeTruthy();
  });

  it('should have tabindex -1 when disabled', async () => {
    @Component({
      imports: [
        NgpCombobox,
        NgpComboboxButton,
        NgpComboboxDropdown,
        NgpComboboxOption,
        NgpComboboxPortal,
      ],
      template: `
        <div [ngpComboboxDisabled]="true" ngpCombobox data-testid="disabled-combobox">
          <button ngpComboboxButton>Select</button>
          <div *ngpComboboxPortal ngpComboboxDropdown>
            <div [ngpComboboxOptionValue]="'test'" ngpComboboxOption>Test</div>
          </div>
        </div>
      `,
    })
    class DisabledComboboxComponent {}

    await render(DisabledComboboxComponent);
    const combobox = screen.getByTestId('disabled-combobox');
    expect(combobox).toHaveAttribute('tabindex', '-1');
  });
});
