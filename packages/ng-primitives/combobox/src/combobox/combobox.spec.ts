import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
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
      ngpCombobox
    >
      <input
        [value]="filter"
        (input)="onFilterChange($event)"
        (blur)="onBlur()"
        data-testid="auto-select-input"
        ngpComboboxInput
      />
      <button data-testid="auto-select-button" ngpComboboxButton>▼</button>
      <div *ngpComboboxPortal ngpComboboxDropdown>
        @for (option of filteredOptions; track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
            {{ option }}
          </div>
        }
      </div>
    </div>
  `,
})
class AutoSelectTestComponent {
  value: string | undefined;
  disabled = false;
  filter = '';
  options = ['Apple', 'Banana', 'Cherry'];

  get filteredOptions() {
    return this.options.filter(opt => opt.toLowerCase().includes(this.filter.toLowerCase()));
  }

  onValueChange(value: string) {
    this.value = value;
  }

  onFilterChange(event: Event) {
    this.filter = (event.target as HTMLInputElement).value;
  }

  onBlur() {
    // Auto-select the first matching option on blur if there's exactly one match
    if (this.filteredOptions.length === 1) {
      this.value = this.filteredOptions[0];
      this.filter = this.filteredOptions[0];
    }
  }
}

describe('NgpCombobox', () => {
  beforeEach(() => {
    // mock ResizeObserver
    window.ResizeObserver = class {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      observe() {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      unobserve() {}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      disconnect() {}
    };

    // patch scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  it('should initialize correctly', async () => {
    await render(TestComponent);

    const comboboxInput = screen.getByRole('combobox');
    expect(comboboxInput).toBeInTheDocument();

    const button = screen.getByTestId('combobox-button');
    expect(button).toBeInTheDocument();
  });

  // it('should open the dropdown when button is clicked', async () => {
  //   await render(TestComponent);

  //   const button = screen.getByTestId('combobox-button');
  //   await userEvent.click(button);

  //   // Check if options are visible
  //   expect(screen.getByText('Apple')).toBeInTheDocument();
  //   expect(screen.getByText('Banana')).toBeInTheDocument();
  //   expect(screen.getByText('Cherry')).toBeInTheDocument();
  // });

  // it('should select an option when clicked', async () => {
  //   const { fixture } = await render(TestComponent);
  //   const component = fixture.componentInstance;

  //   const button = screen.getByTestId('combobox-button');
  //   await userEvent.click(button);

  //   const option = screen.getByText('Banana');
  //   await userEvent.click(option);

  //   expect(component.value).toBe('Banana');
  //   expect(component.filter).toBe('Banana');

  //   // Dropdown should close after selection
  //   await waitFor(() => {
  //     expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  //   });
  // });

  // it('should filter options based on input', async () => {
  //   await render(TestComponent);

  //   const input = screen.getByRole('combobox');
  //   await userEvent.type(input, 'berr');

  //   // Only Elderberry should be visible
  //   expect(screen.getByText('Elderberry')).toBeInTheDocument();
  //   expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  // });

  // it('should display "No options found" when filter has no matches', async () => {
  //   await render(TestComponent);

  //   const input = screen.getByRole('combobox');
  //   await userEvent.type(input, 'xyz');

  //   expect(screen.getByTestId('empty-message')).toBeInTheDocument();
  // });

  // it('should respect disabled state', async () => {
  //   const { fixture } = await render(TestComponent);
  //   const component = fixture.componentInstance;

  //   component.disabled = true;
  //   fixture.detectChanges();

  //   const input = screen.getByRole('combobox');
  //   expect(input).toBeDisabled();

  //   const button = screen.getByTestId('combobox-button');
  //   await userEvent.click(button);

  //   // Dropdown should not open when disabled
  //   expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  // });

  //   it('should support keyboard navigation', async () => {
  //     const { fixture } = await render(TestComponent);
  //     const component = fixture.componentInstance;

  //     const input = screen.getByRole('combobox');
  //     input.focus();

  //     // Open with arrow down
  //     await userEvent.keyboard('{arrowdown}');

  //     // First option should be highlighted
  //     const options = screen.getAllByRole('option');
  //     expect(options[0]).toHaveAttribute('data-active', 'true');

  //     // Move to second option
  //     await userEvent.keyboard('{arrowdown}');
  //     expect(options[1]).toHaveAttribute('data-active', 'true');

  //     // Select with Enter
  //     await userEvent.keyboard('{enter}');
  //     expect(component.value).toBe('Banana');
  //   });

  //   it('should close dropdown when clicking outside', async () => {
  //     await render(TestComponent);

  //     const button = screen.getByTestId('combobox-button');
  //     await userEvent.click(button);

  //     // Dropdown should be open
  //     expect(screen.getByText('Apple')).toBeInTheDocument();

  //     // Click outside
  //     await userEvent.click(document.body);

  //     // Dropdown should be closed
  //     await waitFor(() => {
  //       expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  //     });
  //   });

  //   it('should close dropdown when pressing Escape key', async () => {
  //     await render(TestComponent);

  //     const button = screen.getByTestId('combobox-button');
  //     await userEvent.click(button);

  //     // Dropdown should be open
  //     expect(screen.getByText('Apple')).toBeInTheDocument();

  //     // Press Escape
  //     await userEvent.keyboard('{escape}');

  //     // Dropdown should be closed
  //     await waitFor(() => {
  //       expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  //     });
  //   });

  //   it('should allow typing and filtering in the input', async () => {
  //     const { fixture } = await render(TestComponent);
  //     const component = fixture.componentInstance;

  //     const input = screen.getByRole('combobox');
  //     await userEvent.type(input, 'Ba');

  //     expect(component.filter).toBe('Ba');

  //     // Open dropdown
  //     const button = screen.getByTestId('combobox-button');
  //     await userEvent.click(button);

  //     // Only Banana should be visible
  //     expect(screen.getByText('Banana')).toBeInTheDocument();
  //     expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  //   });

  //   it('should navigate options with keyboard up/down and select with Enter', async () => {
  //     const { fixture } = await render(TestComponent);
  //     const component = fixture.componentInstance;

  //     const input = screen.getByRole('combobox');
  //     input.focus();

  //     // Open dropdown with arrow down
  //     await userEvent.keyboard('{arrowdown}');

  //     // Navigate to Banana (second option)
  //     await userEvent.keyboard('{arrowdown}');

  //     // Navigate to Cherry (third option)
  //     await userEvent.keyboard('{arrowdown}');

  //     // Select Cherry with Enter
  //     await userEvent.keyboard('{enter}');

  //     expect(component.value).toBe('Cherry');
  //   });

  //   it('should wrap keyboard navigation when reaching end of options', async () => {
  //     await render(TestComponent);

  //     const input = screen.getByRole('combobox');
  //     input.focus();

  //     // Open dropdown with arrow down
  //     await userEvent.keyboard('{arrowdown}');

  //     // Navigate down through all options
  //     await userEvent.keyboard('{arrowdown}');
  //     await userEvent.keyboard('{arrowdown}');
  //     await userEvent.keyboard('{arrowdown}');
  //     await userEvent.keyboard('{arrowdown}');
  //     await userEvent.keyboard('{arrowdown}');

  //     // Should wrap to first option
  //     const options = screen.getAllByRole('option');
  //     expect(options[0]).toHaveAttribute('data-hover', 'true');

  //     // Navigate up should go to last option
  //     await userEvent.keyboard('{arrowup}');
  //     expect(options[options.length - 1]).toHaveAttribute('data-hover', 'true');
  //   });

  //   it('should apply active state to the currently selected option', async () => {
  //     const { fixture } = await render(TestComponent);
  //     const component = fixture.componentInstance;

  //     // Set initial value
  //     component.value = 'Banana';
  //     fixture.detectChanges();

  //     const button = screen.getByTestId('combobox-button');
  //     await userEvent.click(button);

  //     // Banana option should have active state
  //     const bananaOption = screen.getByText('Banana');
  //     expect(bananaOption.parentElement).toHaveAttribute('data-active', 'true');
  //   });
  // });

  // describe('NgpCombobox Multi-select', () => {
  //   it('should allow multiple selections', async () => {
  //     const { fixture } = await render(MultiSelectTestComponent);
  //     const component = fixture.componentInstance;

  //     const button = screen.getByTestId('multi-combobox-button');
  //     await userEvent.click(button);

  //     // Select first option
  //     await userEvent.click(screen.getByText('Apple'));
  //     expect(component.value).toEqual(['Apple']);

  //     // Dropdown should stay open after selection
  //     expect(screen.getByText('Banana')).toBeInTheDocument();

  //     // Select second option
  //     await userEvent.click(screen.getByText('Banana'));
  //     expect(component.value).toEqual(['Apple', 'Banana']);
  //   });

  //   it('should toggle selections when clicking on already selected options', async () => {
  //     const { fixture } = await render(MultiSelectTestComponent);
  //     const component = fixture.componentInstance;

  //     // Start with pre-selected options
  //     component.value = ['Apple', 'Cherry'];
  //     fixture.detectChanges();

  //     const button = screen.getByTestId('multi-combobox-button');
  //     await userEvent.click(button);

  //     // Apple should be marked as selected
  //     const appleOption = screen.getByText('Apple').closest('[ngpcomboboxoption]');
  //     expect(appleOption).toHaveAttribute('data-active', 'true');

  //     // Toggle off Apple
  //     await userEvent.click(screen.getByText('Apple'));
  //     expect(component.value).toEqual(['Cherry']);

  //     // Toggle on Banana
  //     await userEvent.click(screen.getByText('Banana'));
  //     expect(component.value).toEqual(['Cherry', 'Banana']);
  //   });

  //   it('should support keyboard navigation with multi-select', async () => {
  //     const { fixture } = await render(MultiSelectTestComponent);
  //     const component = fixture.componentInstance;

  //     const input = screen.getByRole('combobox');
  //     input.focus();

  //     // Open dropdown with arrow down
  //     await userEvent.keyboard('{arrowdown}');

  //     // Navigate to second option
  //     await userEvent.keyboard('{arrowdown}');

  //     // Select with spacebar
  //     await userEvent.keyboard(' ');
  //     expect(component.value).toContain('Banana');

  //     // Dropdown should remain open
  //     expect(screen.getByText('Apple')).toBeInTheDocument();

  //     // Navigate to first option
  //     await userEvent.keyboard('{arrowup}');

  //     // Select with spacebar
  //     await userEvent.keyboard(' ');
  //     expect(component.value).toContain('Apple');
  //     expect(component.value).toHaveLength(2);
  //   });

  //   it('should close multi-select dropdown with Escape key', async () => {
  //     await render(MultiSelectTestComponent);

  //     const input = screen.getByRole('combobox');
  //     input.focus();

  //     // Open dropdown with arrow down
  //     await userEvent.keyboard('{arrowdown}');

  //     // Dropdown should be open
  //     expect(screen.getByText('Apple')).toBeInTheDocument();

  //     // Press Escape
  //     await userEvent.keyboard('{escape}');

  //     // Dropdown should be closed
  //     await waitFor(() => {
  //       expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  //     });
  //   });
  // });

  // describe('NgpComboboxOption', () => {
  //   it('should render custom content inside option', async () => {
  //     @Component({
  //       standalone: true,
  //       imports: [
  //         NgpCombobox,
  //         NgpComboboxButton,
  //         NgpComboboxDropdown,
  //         NgpComboboxInput,
  //         NgpComboboxOption,
  //         NgpComboboxPortal,
  //       ],
  //       template: `
  //         <div ngpCombobox>
  //           <input ngpComboboxInput />
  //           <button ngpComboboxButton>▼</button>
  //           <div *ngpComboboxPortal ngpComboboxDropdown>
  //             <div [ngpComboboxOptionValue]="'Apple'" ngpComboboxOption>
  //               <span data-testid="custom-icon">🍎</span>
  //               Apple
  //             </div>
  //           </div>
  //         </div>
  //       `,
  //     })
  //     class CustomOptionComponent {}

  //     await render(CustomOptionComponent);

  //     const button = screen.getByRole('button');
  //     await userEvent.click(button);

  //     expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  //     expect(screen.getByText('Apple')).toBeInTheDocument();
  //   });
  // });

  // describe('NgpComboboxInput accessibility', () => {
  //   it('should have appropriate ARIA attributes', async () => {
  //     await render(TestComponent);

  //     const input = screen.getByRole('combobox');
  //     expect(input).toHaveAttribute('aria-autocomplete', 'list');

  //     // Open dropdown
  //     const button = screen.getByTestId('combobox-button');
  //     await userEvent.click(button);

  //     expect(input).toHaveAttribute('aria-expanded', 'true');

  //     // Close dropdown
  //     await userEvent.keyboard('{escape}');

  //     await waitFor(() => {
  //       expect(input).toHaveAttribute('aria-expanded', 'false');
  //     });
  //   });
  // });

  // describe('NgpComboboxPortal', () => {
  //   it('should render the dropdown in a portal outside the component', async () => {
  //     await render(TestComponent);

  //     const button = screen.getByTestId('combobox-button');
  //     await userEvent.click(button);

  //     // The dropdown should be rendered outside the immediate parent
  //     const dropdown = screen.getByText('Apple').closest('[ngpcomboboxdropdown]');
  //     expect(dropdown?.parentElement).not.toBe(button.parentElement);
  //   });
  // });

  // describe('NgpCombobox Edge Cases', () => {
  //   it('should auto-select an option when there is only one match on blur', async () => {
  //     const { fixture } = await render(AutoSelectTestComponent);
  //     const component = fixture.componentInstance;

  //     const input = screen.getByTestId('auto-select-input');
  //     await userEvent.type(input, 'App');

  //     // Trigger blur event
  //     fireEvent.blur(input);
  //     fixture.detectChanges();

  //     // Should auto-select "Apple"
  //     expect(component.value).toBe('Apple');
  //   });

  //   it('should allow reopening the dropdown after selection', async () => {
  //     await render(TestComponent);

  //     const button = screen.getByTestId('combobox-button');
  //     await userEvent.click(button);

  //     await userEvent.click(screen.getByText('Apple'));

  //     // Dropdown should be closed after selection
  //     await waitFor(() => {
  //       expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  //     });

  //     // Reopen dropdown
  //     await userEvent.click(button);

  //     // Dropdown should be open again
  //     expect(screen.getByText('Apple')).toBeInTheDocument();
  //     expect(screen.getByText('Banana')).toBeInTheDocument();
  //   });

  //   it('should maintain focus on input after selection', async () => {
  //     await render(TestComponent);

  //     const input = screen.getByRole('combobox');
  //     const button = screen.getByTestId('combobox-button');

  //     // Click to focus input and open dropdown
  //     await userEvent.click(input);
  //     await userEvent.click(button);

  //     await userEvent.click(screen.getByText('Apple'));

  //     // Input should still have focus after selection
  //     expect(document.activeElement).toBe(input);
  //   });
});
