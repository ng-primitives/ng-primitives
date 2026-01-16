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
        <div ngpComboboxOptionValue="all" ngpComboboxOption>Select All</div>
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
            <div ngpComboboxOptionValue="all" ngpComboboxOption>Select All</div>
            <div ngpComboboxOptionValue="Apple" ngpComboboxOption>Apple</div>
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
            <div ngpComboboxOptionValue="all" ngpComboboxOption>Select All</div>
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

describe('NgpCombobox Virtual Scrolling', () => {
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
        [(ngpComboboxValue)]="value"
        [ngpComboboxScrollToOption]="customScrollToOption"
        [ngpComboboxOptions]="allOptions"
        (ngpComboboxValueChange)="onValueChange($event)"
        (ngpComboboxOpenChange)="onOpenChange($event)"
        ngpCombobox
        data-testid="virtual-combobox"
      >
        <input
          [value]="filter"
          (input)="onFilterChange($event)"
          placeholder="Virtual combobox"
          ngpComboboxInput
        />

        <button data-testid="virtual-combobox-button" ngpComboboxButton>▼</button>

        <div *ngpComboboxPortal ngpComboboxDropdown>
          @for (item of renderedItems; track item.index) {
            <div
              [ngpComboboxOptionValue]="item.value"
              [ngpComboboxOptionIndex]="item.index"
              [attr.data-testid]="'virtual-option-' + item.index"
              ngpComboboxOption
            >
              {{ item.value }} ({{ item.index }})
            </div>
          }
        </div>
      </div>
    `,
  })
  class VirtualScrollingTestComponent {
    value: string | undefined = undefined;
    filter = '';
    open = false;
    scrollToOptionCalled = false;
    lastScrollIndex = -1;

    // All options for virtual scrolling (simulating a large dataset)
    allOptions = [
      'Option 0',
      'Option 1',
      'Option 2',
      'Option 3',
      'Option 4',
      'Option 5',
      'Option 6',
      'Option 7',
      'Option 8',
      'Option 9',
      'Option 10',
      'Option 11',
      'Option 12',
      'Option 13',
      'Option 14',
      'Option 15',
      'Option 16',
      'Option 17',
      'Option 18',
      'Option 19',
    ];

    // Simulated virtual scrolling - only render visible items
    startIndex = 0;
    endIndex = 5; // Only show 6 items at a time

    get renderedItems() {
      const filtered = this.filteredOptions;
      return filtered.slice(this.startIndex, this.endIndex + 1).map((value, displayIndex) => ({
        value,
        index: this.startIndex + displayIndex,
      }));
    }

    get filteredOptions() {
      return this.filter
        ? this.allOptions.filter(option => option.toLowerCase().includes(this.filter.toLowerCase()))
        : this.allOptions;
    }

    onValueChange(value: string) {
      this.value = value;
    }

    onFilterChange(event: Event) {
      this.filter = (event.target as HTMLInputElement).value;
    }

    onOpenChange(event: boolean) {
      this.open = event;
    }

    customScrollToOption = (index: number) => {
      this.scrollToOptionCalled = true;
      this.lastScrollIndex = index;

      // Simulate virtual scrolling by updating the rendered range
      const itemsToShow = 6;
      this.startIndex = Math.max(0, index - Math.floor(itemsToShow / 2));
      this.endIndex = Math.min(this.filteredOptions.length - 1, this.startIndex + itemsToShow - 1);
    };
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
        [(ngpComboboxValue)]="value"
        [ngpComboboxOptions]="allOptions"
        [ngpComboboxMultiple]="true"
        (ngpComboboxValueChange)="onValueChange($event)"
        ngpCombobox
        data-testid="virtual-multi-combobox"
      >
        <input placeholder="Virtual multi-select" ngpComboboxInput />

        <button data-testid="virtual-multi-button" ngpComboboxButton>▼</button>

        <div *ngpComboboxPortal ngpComboboxDropdown>
          @for (item of renderedItems; track item.index) {
            <div
              [ngpComboboxOptionValue]="item.value"
              [ngpComboboxOptionIndex]="item.index"
              [attr.data-testid]="'virtual-multi-option-' + item.index"
              ngpComboboxOption
            >
              {{ item.value }}
            </div>
          }
        </div>
      </div>
    `,
  })
  class VirtualMultiSelectTestComponent {
    value: string[] = [];

    allOptions = [
      'Multi Option 0',
      'Multi Option 1',
      'Multi Option 2',
      'Multi Option 3',
      'Multi Option 4',
      'Multi Option 5',
    ];

    // Only render first 3 items to test virtual scrolling
    get renderedItems() {
      return this.allOptions.slice(0, 3).map((value, index) => ({ value, index }));
    }

    onValueChange(values: string[]) {
      this.value = values;
    }
  }

  afterEach(() => {
    const dropdown = screen.queryByRole('listbox');
    if (dropdown) {
      dropdown.remove();
    }
  });

  describe('Virtual Scrolling Integration', () => {
    it('should use allOptions for active descendant count instead of DOM options', async () => {
      const { fixture } = await render(VirtualScrollingTestComponent);
      const component = fixture.componentInstance;

      // Component has 20 allOptions but only renders 6 items
      expect(component.allOptions.length).toBe(20);
      expect(component.renderedItems.length).toBe(6);

      const button = screen.getByTestId('virtual-combobox-button');
      await userEvent.click(button);

      // The combobox should know about all 20 options for keyboard navigation
      // even though only 6 are rendered in DOM
      expect(component.open).toBeTruthy();
    });

    it('should call custom scroll function when opening dropdown with selected item', async () => {
      const { fixture } = await render(VirtualScrollingTestComponent);
      const component = fixture.componentInstance;

      // Set a value that's not in the initially rendered range
      component.value = 'Option 10';
      fixture.detectChanges();

      const button = screen.getByTestId('virtual-combobox-button');
      await userEvent.click(button);

      // Custom scroll function should be called with the index of the selected option
      expect(component.scrollToOptionCalled).toBeTruthy();
      expect(component.lastScrollIndex).toBe(10);
    });

    it('should handle keyboard navigation with virtual indices', async () => {
      const { fixture } = await render(VirtualScrollingTestComponent);
      const component = fixture.componentInstance;

      const input = screen.getByRole('combobox');
      input.focus();

      // Open dropdown
      await userEvent.keyboard('{arrowdown}');
      expect(component.open).toBeTruthy();

      // First rendered option (index 0) should be active
      const firstOption = screen.getByTestId('virtual-option-0');
      expect(firstOption).toHaveAttribute('data-active');

      // Navigate down should go to index 1
      await userEvent.keyboard('{arrowdown}');
      const secondOption = screen.getByTestId('virtual-option-1');
      expect(secondOption).toHaveAttribute('data-active');
    });

    it('should select options by index when virtual scrolling is used', async () => {
      const { fixture } = await render(VirtualScrollingTestComponent);
      const component = fixture.componentInstance;

      const button = screen.getByTestId('virtual-combobox-button');
      await userEvent.click(button);

      // Click on the option with index 2
      const option = screen.getByTestId('virtual-option-2');
      await userEvent.click(option);

      expect(component.value).toBe('Option 2');

      // Dropdown should close after selection
      await waitFor(() => {
        expect(component.open).toBeFalsy();
      });
    });

    it('should support option selection with Enter key using virtual indices', async () => {
      const { fixture } = await render(VirtualScrollingTestComponent);
      const component = fixture.componentInstance;

      const input = screen.getByRole('combobox');
      input.focus();

      // Open and navigate to second option (index 1)
      await userEvent.keyboard('{arrowdown}');
      await userEvent.keyboard('{arrowdown}');

      // Select with Enter
      await userEvent.keyboard('{enter}');

      expect(component.value).toBe('Option 1');
    });

    it('should maintain virtual scroll position when filtering', async () => {
      const { fixture } = await render(VirtualScrollingTestComponent);
      const component = fixture.componentInstance;

      // Set initial scroll position
      component.customScrollToOption(5);
      expect(component.startIndex).toBe(2); // 5 - 3 (half of items to show)
      expect(component.endIndex).toBe(7); // 2 + 6 - 1

      const input = screen.getByRole('combobox');

      // Filter options - this should reset the virtual scroll
      await userEvent.type(input, '1');
      fixture.detectChanges();

      // Check that filtering works
      const filteredOptions = component.filteredOptions;
      expect(filteredOptions).toEqual([
        'Option 1',
        'Option 10',
        'Option 11',
        'Option 12',
        'Option 13',
        'Option 14',
        'Option 15',
        'Option 16',
        'Option 17',
        'Option 18',
        'Option 19',
      ]);
    });

    it('should handle pointer events correctly with virtual indices', async () => {
      await render(VirtualScrollingTestComponent);

      const button = screen.getByTestId('virtual-combobox-button');
      await userEvent.click(button);

      const option = screen.getByTestId('virtual-option-3');

      // Hover over option should activate it
      await userEvent.hover(option);
      expect(option).toHaveAttribute('data-active');

      // Unhover should deactivate
      await userEvent.unhover(option);
      expect(option).not.toHaveAttribute('data-active');
    });

    it('should find selected option from allOptions when opening dropdown', async () => {
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
            [(ngpComboboxValue)]="value"
            [ngpComboboxOptions]="allOptions"
            (ngpComboboxValueChange)="onValueChange($event)"
            ngpCombobox
          >
            <input ngpComboboxInput />
            <button data-testid="preselected-button" ngpComboboxButton>▼</button>
            <div *ngpComboboxPortal ngpComboboxDropdown>
              <!-- Only render a subset of all options -->
              @for (option of visibleOptions; track option; let i = $index) {
                <div
                  [ngpComboboxOptionValue]="option"
                  [ngpComboboxOptionIndex]="allOptions.indexOf(option)"
                  [attr.data-testid]="'preselected-option-' + allOptions.indexOf(option)"
                  ngpComboboxOption
                >
                  {{ option }}
                </div>
              }
            </div>
          </div>
        `,
      })
      class PreselectedVirtualComponent {
        value = 'Virtual Option 5'; // Pre-select an option
        allOptions = [
          'Virtual Option 0',
          'Virtual Option 1',
          'Virtual Option 2',
          'Virtual Option 3',
          'Virtual Option 4',
          'Virtual Option 5',
        ];

        // Only show options 3-5
        get visibleOptions() {
          return this.allOptions.slice(3);
        }

        onValueChange(value: string) {
          this.value = value;
        }
      }

      const { fixture } = await render(PreselectedVirtualComponent);
      const component = fixture.componentInstance;

      // Verify initial state
      expect(component.value).toBe('Virtual Option 5');

      const button = screen.getByTestId('preselected-button');
      await userEvent.click(button);

      // The selected option should be active even though it comes from allOptions
      const selectedOption = screen.getByTestId('preselected-option-5');
      expect(selectedOption).toHaveAttribute('data-active');
    });
  });

  describe('Virtual Scrolling with Multiple Selection', () => {
    it('should support multiple selection with virtual scrolling', async () => {
      const { fixture } = await render(VirtualMultiSelectTestComponent);
      const component = fixture.componentInstance;

      const button = screen.getByTestId('virtual-multi-button');
      await userEvent.click(button);

      // Select multiple options
      await userEvent.click(screen.getByTestId('virtual-multi-option-0'));
      await userEvent.click(screen.getByTestId('virtual-multi-option-2'));

      expect(component.value).toEqual(['Multi Option 0', 'Multi Option 2']);

      // Dropdown should stay open
      expect(screen.getByTestId('virtual-multi-option-1')).toBeInTheDocument();
    });

    it('should toggle virtual options in multi-select mode', async () => {
      const { fixture } = await render(VirtualMultiSelectTestComponent);
      const component = fixture.componentInstance;

      const button = screen.getByTestId('virtual-multi-button');
      await userEvent.click(button);

      // Select an option
      await userEvent.click(screen.getByTestId('virtual-multi-option-1'));
      expect(component.value).toEqual(['Multi Option 1']);

      // Click again to deselect
      await userEvent.click(screen.getByTestId('virtual-multi-option-1'));
      expect(component.value).toEqual([]);
    });

    it('should show selected state for virtual options', async () => {
      const { fixture } = await render(VirtualMultiSelectTestComponent);
      const component = fixture.componentInstance;

      // Pre-select some options
      component.value = ['Multi Option 1', 'Multi Option 4'];
      fixture.detectChanges();

      const button = screen.getByTestId('virtual-multi-button');
      await userEvent.click(button);

      // Check that selected option is marked
      const selectedOption = screen.getByTestId('virtual-multi-option-1');
      expect(selectedOption).toHaveAttribute('data-selected');

      // Non-selected option should not be marked
      const unselectedOption = screen.getByTestId('virtual-multi-option-0');
      expect(unselectedOption).not.toHaveAttribute('data-selected');
    });
  });

  describe('Custom Scroll Function Integration', () => {
    it('should call custom scroll function during keyboard navigation', async () => {
      const { fixture } = await render(VirtualScrollingTestComponent);
      const component = fixture.componentInstance;

      const input = screen.getByRole('combobox');
      input.focus();

      // Open dropdown
      await userEvent.keyboard('{arrowdown}');

      // Reset scroll tracking
      component.scrollToOptionCalled = false;
      component.lastScrollIndex = -1;

      // Navigate to an option that might trigger scrolling
      for (let i = 0; i < 10; i++) {
        await userEvent.keyboard('{arrowdown}');
      }

      // Custom scroll function should have been called
      expect(component.scrollToOptionCalled).toBeTruthy();
    });

    it('should not call default scrollIntoView when custom scroll function is provided', async () => {
      const { fixture } = await render(VirtualScrollingTestComponent);
      const component = fixture.componentInstance;

      // Spy on scrollIntoView to ensure it's not called
      const scrollIntoViewSpy = jest
        .spyOn(Element.prototype, 'scrollIntoView')
        .mockImplementation();

      const input = screen.getByRole('combobox');
      input.focus();

      // Open dropdown and navigate
      await userEvent.keyboard('{arrowdown}');
      await userEvent.keyboard('{arrowdown}');

      // Default scrollIntoView should not be called when custom function is provided
      expect(scrollIntoViewSpy).not.toHaveBeenCalled();
      expect(component.scrollToOptionCalled).toBeTruthy();

      scrollIntoViewSpy.mockRestore();
    });

    it('should handle Home and End keys with virtual scrolling', async () => {
      const { fixture } = await render(VirtualScrollingTestComponent);
      const component = fixture.componentInstance;

      const input = screen.getByRole('combobox');
      input.focus();

      // Open dropdown
      await userEvent.keyboard('{arrowdown}');

      // Reset scroll tracking
      component.scrollToOptionCalled = false;

      // Press End key - should scroll to last option
      await userEvent.keyboard('{End}');
      expect(component.scrollToOptionCalled).toBeTruthy();

      // Reset and test Home key
      component.scrollToOptionCalled = false;
      await userEvent.keyboard('{Home}');
      expect(component.scrollToOptionCalled).toBeTruthy();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty allOptions gracefully', async () => {
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
          <div [ngpComboboxOptions]="[]" ngpCombobox>
            <input ngpComboboxInput />
            <button data-testid="empty-virtual-button" ngpComboboxButton>▼</button>
            <div *ngpComboboxPortal ngpComboboxDropdown>
              <div data-testid="no-options">No options available</div>
            </div>
          </div>
        `,
      })
      class EmptyVirtualComponent {}

      await render(EmptyVirtualComponent);

      const button = screen.getByTestId('empty-virtual-button');
      await userEvent.click(button);

      // Should handle empty options without errors
      expect(screen.getByTestId('no-options')).toBeInTheDocument();
    });

    it('should fall back to DOM options when allOptions is not provided', async () => {
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
          <div [(ngpComboboxValue)]="value" ngpCombobox>
            <input ngpComboboxInput />
            <button data-testid="fallback-button" ngpComboboxButton>▼</button>
            <div *ngpComboboxPortal ngpComboboxDropdown>
              <div ngpComboboxOptionValue="Option 1" ngpComboboxOption>Option 1</div>
              <div ngpComboboxOptionValue="Option 2" ngpComboboxOption>Option 2</div>
            </div>
          </div>
        `,
      })
      class FallbackComponent {
        value: string | undefined = undefined;
      }

      const { fixture } = await render(FallbackComponent);

      const button = screen.getByTestId('fallback-button');
      await userEvent.click(button);

      // Should work with DOM options when allOptions is not provided
      const option = screen.getByText('Option 1');
      await userEvent.click(option);

      // Should select successfully
      expect(fixture.componentInstance.value).toBe('Option 1');
    });

    it('should handle mismatched allOptions and rendered options', async () => {
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
            [(ngpComboboxValue)]="value"
            [ngpComboboxOptions]="allOptions"
            (ngpComboboxValueChange)="onValueChange($event)"
            ngpCombobox
          >
            <input ngpComboboxInput />
            <button data-testid="mismatch-button" ngpComboboxButton>▼</button>
            <div *ngpComboboxPortal ngpComboboxDropdown>
              <!-- Only render first 2 options, but allOptions has 5 -->
              @for (option of allOptions.slice(0, 2); track option; let i = $index) {
                <div
                  [ngpComboboxOptionValue]="option"
                  [ngpComboboxOptionIndex]="i"
                  [attr.data-testid]="'mismatch-option-' + i"
                  ngpComboboxOption
                >
                  {{ option }}
                </div>
              }
            </div>
          </div>
        `,
      })
      class MismatchComponent {
        value: string | undefined = 'Option 3'; // Not in rendered options
        allOptions = ['Option 0', 'Option 1', 'Option 2', 'Option 3', 'Option 4'];

        onValueChange(value: string) {
          this.value = value;
        }
      }

      const { fixture } = await render(MismatchComponent);
      const component = fixture.componentInstance;

      const button = screen.getByTestId('mismatch-button');
      await userEvent.click(button);

      // Should handle the case where selected option is not in rendered options
      // but is in allOptions
      expect(component.value).toBe('Option 3');

      // Should still be able to select rendered options
      await userEvent.click(screen.getByTestId('mismatch-option-1'));
      expect(component.value).toBe('Option 1');
    });

    it('should handle selection state correctly with virtual options', async () => {
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
            [(ngpComboboxValue)]="value"
            [ngpComboboxOptions]="allOptions"
            (ngpComboboxValueChange)="onValueChange($event)"
            ngpCombobox
          >
            <input ngpComboboxInput />
            <button data-testid="selection-state-button" ngpComboboxButton>▼</button>
            <div *ngpComboboxPortal ngpComboboxDropdown>
              @for (option of allOptions; track option; let i = $index) {
                <div
                  [ngpComboboxOptionValue]="option"
                  [ngpComboboxOptionIndex]="i"
                  [attr.data-testid]="'selection-option-' + i"
                  ngpComboboxOption
                >
                  {{ option }}
                </div>
              }
            </div>
          </div>
        `,
      })
      class SelectionStateComponent {
        value: string | undefined = undefined;
        allOptions = ['State Option A', 'State Option B', 'State Option C'];

        onValueChange(value: string) {
          this.value = value;
        }
      }

      const { fixture } = await render(SelectionStateComponent);
      const component = fixture.componentInstance;

      const button = screen.getByTestId('selection-state-button');
      await userEvent.click(button);

      // Select an option
      await userEvent.click(screen.getByTestId('selection-option-1'));
      expect(component.value).toBe('State Option B');

      // Re-open dropdown
      await userEvent.click(button);

      // The selected option should be marked as selected
      const selectedOption = screen.getByTestId('selection-option-1');
      expect(selectedOption).toHaveAttribute('data-selected');
      expect(selectedOption).toHaveAttribute('data-active'); // Should also be active when opening

      // Other options should not be selected
      expect(screen.getByTestId('selection-option-0')).not.toHaveAttribute('data-selected');
      expect(screen.getByTestId('selection-option-2')).not.toHaveAttribute('data-selected');
    });
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

  it('should open the dropdown when pressing Space on focused combobox without input', async () => {
    await render(NoInputTestComponent);

    const combobox = screen.getByTestId('combobox-without-input');
    const button = screen.getByTestId('combobox-button');

    combobox.focus();
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
      (ngpComboboxValueChange)="onValueChange($event)"
      ngpCombobox
      data-testid="activated-combobox"
    >
      <input ngpComboboxInput />
      <button data-testid="activated-combobox-button" ngpComboboxButton>▼</button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        <div
          (ngpComboboxOptionActivated)="onClearActivated()"
          ngpComboboxOption
          data-testid="clear-option"
        >
          Clear
        </div>
        @for (option of options; track option) {
          <div
            [ngpComboboxOptionValue]="option"
            [attr.data-testid]="'option-' + option"
            (ngpComboboxOptionActivated)="onOptionActivated(option)"
            ngpComboboxOption
          >
            {{ option }}
          </div>
        }
      </div>
    </div>
  `,
})
class TestActivatedOutputComponent {
  readonly options = ['Apple', 'Banana', 'Cherry'];
  value: string | undefined = undefined;
  readonly activatedOptions: string[] = [];
  clearActivatedCount = 0;

  onValueChange(value: string): void {
    this.value = value;
  }

  onOptionActivated(option: string): void {
    this.activatedOptions.push(option);
  }

  onClearActivated(): void {
    this.clearActivatedCount++;
    this.value = undefined;
  }
}

describe('NgpComboboxOption activated output', () => {
  afterEach(() => {
    const dropdown = screen.queryByRole('listbox');
    if (dropdown) {
      dropdown.remove();
    }
  });

  it('should emit activated when option with value is clicked', async () => {
    const { fixture } = await render(TestActivatedOutputComponent);
    const component = fixture.componentInstance;

    const button = screen.getByTestId('activated-combobox-button');
    await userEvent.click(button);

    const appleOption = screen.getByTestId('option-Apple');
    await userEvent.click(appleOption);

    expect(component.activatedOptions).toContain('Apple');
    expect(component.value).toBe('Apple');
  });

  it('should emit activated when option without value is clicked', async () => {
    const { fixture } = await render(TestActivatedOutputComponent);
    const component = fixture.componentInstance;

    // First select a value
    component.value = 'Banana';
    fixture.detectChanges();

    const button = screen.getByTestId('activated-combobox-button');
    await userEvent.click(button);

    const clearOption = screen.getByTestId('clear-option');
    await userEvent.click(clearOption);

    expect(component.clearActivatedCount).toBe(1);
    expect(component.value).toBeUndefined();
  });

  it('should emit activated when Enter is pressed on option with value', async () => {
    const { fixture } = await render(TestActivatedOutputComponent);
    const component = fixture.componentInstance;

    const input = screen.getByRole('combobox');
    input.focus();

    // Open dropdown
    await userEvent.keyboard('{arrowdown}');

    // Navigate to Apple (skip the Clear option which has no value)
    await userEvent.keyboard('{arrowdown}');

    // Select with Enter
    await userEvent.keyboard('{enter}');

    await waitFor(() => {
      expect(component.activatedOptions).toContain('Apple');
      expect(component.value).toBe('Apple');
    });
  });

  it('should emit activated when Enter is pressed on option without value', async () => {
    const { fixture } = await render(TestActivatedOutputComponent);
    const component = fixture.componentInstance;

    // First select a value
    component.value = 'Cherry';
    fixture.detectChanges();

    const input = screen.getByRole('combobox');
    input.focus();

    // Open dropdown
    await userEvent.keyboard('{arrowdown}');

    // The Clear option (no value) should be first
    // Navigate to it using Home key to ensure we're at the beginning
    await userEvent.keyboard('{Home}');

    // Select with Enter - this should trigger the activated output
    await userEvent.keyboard('{enter}');

    await waitFor(() => {
      expect(component.clearActivatedCount).toBe(1);
      expect(component.value).toBeUndefined();
    });
  });

  it('should emit activated for each click on the same option', async () => {
    const { fixture } = await render(TestActivatedOutputComponent);
    const component = fixture.componentInstance;

    const button = screen.getByTestId('activated-combobox-button');

    // Click option multiple times (combobox closes after single select, so reopen each time)
    await userEvent.click(button);
    await userEvent.click(screen.getByTestId('option-Apple'));

    await userEvent.click(button);
    await userEvent.click(screen.getByTestId('option-Apple'));

    await userEvent.click(button);
    await userEvent.click(screen.getByTestId('option-Apple'));

    expect(component.activatedOptions.filter(o => o === 'Apple').length).toBe(3);
  });
});
