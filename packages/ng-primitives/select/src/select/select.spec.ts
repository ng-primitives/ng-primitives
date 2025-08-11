import { Component } from '@angular/core';
import { render, screen, waitFor } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { NgpSelectButton } from '../select-button/select-button';
import { NgpSelectDropdown } from '../select-dropdown/select-dropdown';
import { NgpSelectOption } from '../select-option/select-option';
import { NgpSelectPortal } from '../select-portal/select-portal';
import { NgpSelect } from './select';

@Component({
  imports: [NgpSelect, NgpSelectButton, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
  template: `
    <div
      [ngpSelectValue]="value"
      [ngpSelectDisabled]="disabled"
      (ngpSelectValueChange)="onValueChange($event)"
      (ngpSelectOpenChange)="onOpenChange($event)"
      ngpSelect
    >
      <input
        [value]="filter"
        (input)="onFilterChange($event)"
        placeholder="Select an option"
        ngpSelectInput
      />

      <button data-testid="select-button" ngpSelectButton>▼</button>

      <div *ngpSelectPortal ngpSelectDropdown>
        @for (option of filteredOptions(); track option) {
          <div [ngpSelectOptionValue]="option" ngpSelectOption>
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
  imports: [NgpSelect, NgpSelectButton, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
  template: `
    <div
      [ngpSelectValue]="value"
      [ngpSelectMultiple]="true"
      (ngpSelectValueChange)="onValueChange($event)"
      ngpSelect
    >
      <input
        [value]="filter"
        (input)="onFilterChange($event)"
        placeholder="Select options"
        ngpSelectInput
      />

      <button data-testid="multi-select-button" ngpSelectButton>▼</button>

      <div *ngpSelectPortal ngpSelectDropdown>
        @for (option of filteredOptions(); track option) {
          <div [ngpSelectOptionValue]="option" ngpSelectOption>
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

describe('NgpSelect', () => {
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

    const selectInput = screen.getByRole('select');
    expect(selectInput).toBeInTheDocument();

    const button = screen.getByTestId('select-button');
    expect(button).toBeInTheDocument();
  });

  it('should open the dropdown when button is clicked', async () => {
    await render(TestComponent);

    const button = screen.getByTestId('select-button');
    await userEvent.click(button);

    // Check if options are visible
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('should select an option when clicked', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const button = screen.getByTestId('select-button');
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

    const input = screen.getByRole('select');
    await userEvent.type(input, 'berr');

    // Only Elderberry should be visible
    expect(screen.getByText('Elderberry')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('should display "No options found" when filter has no matches', async () => {
    await render(TestComponent);

    const input = screen.getByRole('select');
    await userEvent.type(input, 'xyz');

    expect(screen.getByTestId('empty-message')).toBeInTheDocument();
  });

  it('should respect disabled state', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    component.disabled = true;
    fixture.detectChanges();

    const input = screen.getByRole('select');
    expect(input).toBeDisabled();

    const button = screen.getByTestId('select-button');
    await userEvent.click(button);

    // Dropdown should not open when disabled
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('should support keyboard navigation', async () => {
    const { fixture } = await render(TestComponent);
    const component = fixture.componentInstance;

    const input = screen.getByRole('select');
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

    const button = screen.getByTestId('select-button');
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

    const button = screen.getByTestId('select-button');
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

    const button = screen.getByTestId('select-button');
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

    const input = screen.getByRole('select');
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

    const input = screen.getByRole('select');
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

    const input = screen.getByRole('select');
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

    const button = screen.getByTestId('select-button');
    await userEvent.click(button);
    fixture.detectChanges();

    // Banana option should have active state
    const bananaOption = screen.getByText('Banana');
    expect(bananaOption).toHaveAttribute('data-active');
  });
});

describe('NgpSelect Multi-select', () => {
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
    const button = screen.getByTestId('multi-select-button');
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
    const button = screen.getByTestId('multi-select-button');
    await userEvent.click(button);
    // Apple should be marked as selected
    const appleOption = screen.getByText('Apple').closest('[ngpselectoption]');
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
    const input = screen.getByRole('select');
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
    const input = screen.getByRole('select');
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

describe('NgpSelectOption', () => {
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
      imports: [NgpSelect, NgpSelectButton, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
      template: `
        <div ngpSelect>
          <input ngpSelectInput />
          <button ngpSelectButton>▼</button>
          <div *ngpSelectPortal ngpSelectDropdown>
            <div [ngpSelectOptionValue]="'Apple'" ngpSelectOption>
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

describe('NgpSelectInput', () => {
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
    const input = screen.getByRole('select');
    await userEvent.type(input, 'Nonexistent Option');
    expect(async () => await userEvent.keyboard('{enter}')).not.toThrow();
  });

  it('should have appropriate ARIA attributes', async () => {
    const { detectChanges } = await render(TestComponent);
    const input = screen.getByRole('select');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    // Open dropdown
    const button = screen.getByTestId('select-button');
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

describe('NgpSelectPortal', () => {
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
    const button = screen.getByTestId('select-button');
    await userEvent.click(button);
    // The dropdown should be rendered outside the immediate parent
    const dropdown = screen.getByText('Apple').closest('[ngpselectdropdown]');
    expect(dropdown?.parentElement).not.toBe(button.parentElement);
  });
});
