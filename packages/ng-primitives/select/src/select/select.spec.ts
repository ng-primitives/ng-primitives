import { Component, signal } from '@angular/core';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal } from '../index';

@Component({
  template: `
    <div [(ngpSelectValue)]="value" ngpSelect data-testid="select">
      @if (value(); as value) {
        <span data-testid="selected-value">{{ value }}</span>
      } @else {
        <span data-testid="placeholder">Select an option</span>
      }

      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        @for (option of options; track option) {
          <div
            [ngpSelectOptionValue]="option"
            [attr.data-testid]="'option-' + option"
            ngpSelectOption
          >
            {{ option }}
          </div>
        }
      </div>
    </div>
  `,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
})
class TestSelectComponent {
  readonly options = ['Apple', 'Banana', 'Cherry'];
  readonly value = signal<string | undefined>(undefined);
}

@Component({
  template: `
    <div [(ngpSelectValue)]="value" ngpSelect ngpSelectMultiple data-testid="multi-select">
      @if (value().length > 0) {
        <span data-testid="selected-values">{{ value().join(', ') }}</span>
      } @else {
        <span data-testid="placeholder">Select options</span>
      }

      <div *ngpSelectPortal ngpSelectDropdown data-testid="dropdown">
        @for (option of options; track option) {
          <div
            [ngpSelectOptionValue]="option"
            [attr.data-testid]="'option-' + option"
            ngpSelectOption
          >
            {{ option }}
          </div>
        }
      </div>
    </div>
  `,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
})
class TestMultiSelectComponent {
  readonly options = ['Apple', 'Banana', 'Cherry'];
  readonly value = signal<string[]>([]);
}

@Component({
  template: `
    <div [(ngpSelectValue)]="value" ngpSelect ngpSelectDisabled data-testid="disabled-select">
      <span>Disabled Select</span>
      <div *ngpSelectPortal ngpSelectDropdown>
        <div ngpSelectOptionValue="option1" ngpSelectOption>Option 1</div>
      </div>
    </div>
  `,
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
})
class TestDisabledSelectComponent {
  readonly value = signal<string | undefined>(undefined);
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

  describe('Basic functionality', () => {
    it('should render with placeholder when no value is selected', async () => {
      await render(TestSelectComponent);

      expect(screen.getByTestId('placeholder')).toBeInTheDocument();
      expect(screen.getByTestId('placeholder')).toHaveTextContent('Select an option');
    });

    it('should have correct ARIA attributes when closed', async () => {
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      expect(select).toHaveAttribute('role', 'combobox');
      expect(select).toHaveAttribute('aria-expanded', 'false');
      expect(select).toHaveAttribute('tabindex', '0');
      expect(select).not.toHaveAttribute('aria-controls');
    });

    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      await user.click(select);

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByTestId('dropdown')).toBeInTheDocument();
      });
    });

    it('should close dropdown when clicked again', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');

      // Open dropdown
      await user.click(select);

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'true');
      });

      // Close dropdown
      await user.click(select);

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should render all options when dropdown is open', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      await user.click(screen.getByTestId('select'));

      await waitFor(() => {
        expect(screen.getByTestId('option-Apple')).toBeInTheDocument();
        expect(screen.getByTestId('option-Banana')).toBeInTheDocument();
        expect(screen.getByTestId('option-Cherry')).toBeInTheDocument();
      });
    });

    it('should select option and close dropdown when option is clicked', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      await user.click(select);

      const appleOption = screen.getByTestId('option-Apple');
      await user.click(appleOption);

      await waitFor(() => {
        expect(fixture.componentInstance.value()).toBe('Apple');
        expect(screen.getByTestId('selected-value')).toHaveTextContent('Apple');
        expect(select).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should update selected value when value input changes', async () => {
      const { fixture } = await render(TestSelectComponent);

      // Programmatically set value
      fixture.componentInstance.value.set('Banana');
      fixture.detectChanges();

      expect(screen.getByTestId('selected-value')).toHaveTextContent('Banana');
    });
  });

  describe('Keyboard navigation', () => {
    it('should open dropdown when ArrowDown is pressed', async () => {
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      select.focus();

      fireEvent.keyDown(select, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should open dropdown when ArrowUp is pressed', async () => {
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      select.focus();

      fireEvent.keyDown(select, { key: 'ArrowUp' });

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should open dropdown when Enter is pressed', async () => {
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      select.focus();

      fireEvent.keyDown(select, { key: 'Enter' });

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should open dropdown when Space is pressed', async () => {
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      select.focus();

      fireEvent.keyDown(select, { key: ' ' });

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('should navigate through options with arrow keys when dropdown is open', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      await user.click(select);

      // First option should be active initially
      await waitFor(() => {
        expect(screen.getByTestId('option-Apple')).toHaveAttribute('data-active', '');
      });

      // Navigate to next option
      fireEvent.keyDown(select, { key: 'ArrowDown' });
      await waitFor(() => {
        expect(screen.getByTestId('option-Banana')).toHaveAttribute('data-active', '');
      });

      // Navigate to previous option
      fireEvent.keyDown(select, { key: 'ArrowUp' });
      await waitFor(() => {
        expect(screen.getByTestId('option-Apple')).toHaveAttribute('data-active', '');
      });
    });

    it('should select active option when Enter is pressed', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      await user.click(select);

      // Navigate to Banana
      fireEvent.keyDown(select, { key: 'ArrowDown' });

      // Select it
      fireEvent.keyDown(select, { key: 'Enter' });

      await waitFor(() => {
        expect(fixture.componentInstance.value()).toBe('Banana');
        expect(select).toHaveAttribute('aria-expanded', 'false');
      });
    });

    it('should jump to first option when Home is pressed', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      await user.click(select);

      // Navigate to last option first
      fireEvent.keyDown(select, { key: 'ArrowDown' });
      fireEvent.keyDown(select, { key: 'ArrowDown' });

      // Jump to first
      fireEvent.keyDown(select, { key: 'Home' });

      expect(screen.getByTestId('option-Apple')).toHaveAttribute('data-active', '');
    });

    it('should jump to last option when End is pressed', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      await user.click(select);

      // Jump to last
      fireEvent.keyDown(select, { key: 'End' });
      expect(screen.getByTestId('option-Cherry')).toHaveAttribute('data-active', '');
    });
  });

  describe('Multiple selection', () => {
    it('should allow multiple selections', async () => {
      const user = userEvent.setup();
      const { fixture } = await render(TestMultiSelectComponent);

      const select = screen.getByTestId('multi-select');
      await user.click(select);

      // Select Apple
      await user.click(screen.getByTestId('option-Apple'));
      expect(fixture.componentInstance.value()).toEqual(['Apple']);
      expect(select).toHaveAttribute('aria-expanded', 'true'); // Should stay open

      // Select Banana
      await user.click(screen.getByTestId('option-Banana'));
      expect(fixture.componentInstance.value()).toEqual(['Apple', 'Banana']);
      expect(select).toHaveAttribute('aria-expanded', 'true'); // Should stay open
    });

    // it('should deselect already selected option in multiple mode', async () => {
    //   const user = userEvent.setup();
    //   const { fixture } = await render(TestMultiSelectComponent);

    //   const select = screen.getByTestId('multi-select');
    //   await user.click(select);

    //   // Select Apple
    //   await user.click(screen.getByTestId('option-Apple'));
    //   expect(fixture.componentInstance.value()).toEqual(['Apple']);

    //   // Try to select Apple again
    //   await user.click(select);
    //   await user.click(screen.getByTestId('option-Apple'));
    //   expect(fixture.componentInstance.value()).toEqual(['']);
    // });

    it('should show data-multiple attribute when multiple is enabled', async () => {
      await render(TestMultiSelectComponent);

      const select = screen.getByTestId('multi-select');
      expect(select).toHaveAttribute('data-multiple', '');
    });
  });

  describe('Disabled state', () => {
    it('should have correct attributes when disabled', async () => {
      await render(TestDisabledSelectComponent);

      const select = screen.getByTestId('disabled-select');
      expect(select).toHaveAttribute('data-disabled', '');
      expect(select).toHaveAttribute('tabindex', '-1');
    });

    it('should not open dropdown when clicked and disabled', async () => {
      const user = userEvent.setup();
      await render(TestDisabledSelectComponent);

      const select = screen.getByTestId('disabled-select');
      await user.click(select);

      expect(select).toHaveAttribute('aria-expanded', 'false');
    });

    it('should not respond to keyboard events when disabled', async () => {
      await render(TestDisabledSelectComponent);

      const select = screen.getByTestId('disabled-select');

      fireEvent.keyDown(select, { key: 'ArrowDown' });
      expect(select).toHaveAttribute('aria-expanded', 'false');

      fireEvent.keyDown(select, { key: 'Enter' });
      expect(select).toHaveAttribute('aria-expanded', 'false');

      fireEvent.keyDown(select, { key: ' ' });
      expect(select).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Focus management', () => {
    it('should close dropdown when focus is lost', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      await user.click(select);

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'true');
      });

      // Blur the select
      fireEvent.blur(select);

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  describe('Mouse interactions', () => {
    it('should activate option on pointer enter', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      await user.click(select);

      const bananaOption = screen.getByTestId('option-Banana');
      fireEvent.pointerEnter(bananaOption);

      await waitFor(() => {
        expect(bananaOption).toHaveAttribute('data-active', '');
      });
    });

    it('should deactivate option on pointer leave', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      await user.click(select);

      const bananaOption = screen.getByTestId('option-Banana');
      fireEvent.pointerEnter(bananaOption);
      await waitFor(() => {
        expect(bananaOption).toHaveAttribute('data-active');
      });

      fireEvent.pointerLeave(bananaOption);

      await waitFor(() => {
        expect(bananaOption).not.toHaveAttribute('data-active');
      });
    });
  });

  describe('ARIA attributes', () => {
    it('should have correct aria-controls when dropdown is open', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      await user.click(select);

      const dropdown = screen.getByTestId('dropdown');
      const dropdownId = dropdown.getAttribute('id');

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-controls', dropdownId);
      });
    });

    it('should have correct aria-activedescendant when option is active', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      await user.click(select);

      const appleOption = screen.getByTestId('option-Apple');
      const optionId = appleOption.getAttribute('id');

      await waitFor(() => {
        expect(select).toHaveAttribute('aria-activedescendant', optionId);
      });
    });

    it('should set aria-selected on selected options', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      const select = screen.getByTestId('select');
      await user.click(select);

      const appleOption = screen.getByTestId('option-Apple');
      await user.click(appleOption);

      // Reopen to check aria-selected
      await user.click(select);
      expect(appleOption).toHaveAttribute('aria-selected', 'true');
    });

    it('should have listbox role on dropdown', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      await user.click(screen.getByTestId('select'));
      const dropdown = screen.getByTestId('dropdown');

      expect(dropdown).toHaveAttribute('role', 'listbox');
    });

    it('should have option role on options', async () => {
      const user = userEvent.setup();
      await render(TestSelectComponent);

      await user.click(screen.getByTestId('select'));

      expect(screen.getByTestId('option-Apple')).toHaveAttribute('role', 'option');
      expect(screen.getByTestId('option-Banana')).toHaveAttribute('role', 'option');
      expect(screen.getByTestId('option-Cherry')).toHaveAttribute('role', 'option');
    });
  });
});
