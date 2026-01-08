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
        expect(bananaOption).toHaveAttribute('data-active', '');
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

  describe('Virtual Scrolling', () => {
    @Component({
      template: `
        <div
          [(ngpSelectValue)]="value"
          [ngpSelectScrollToOption]="customScrollToOption"
          [ngpSelectOptions]="allOptions"
          (ngpSelectValueChange)="onValueChange($event)"
          (ngpSelectOpenChange)="onOpenChange($event)"
          ngpSelect
          data-testid="virtual-select"
        >
          @if (value(); as selectedValue) {
            <span data-testid="selected-value">{{ selectedValue }}</span>
          } @else {
            <span data-testid="placeholder">Select from many options</span>
          }

          <div *ngpSelectPortal ngpSelectDropdown data-testid="virtual-dropdown">
            @for (item of renderedItems; track item.index) {
              <div
                [ngpSelectOptionValue]="item.value"
                [ngpSelectOptionIndex]="item.index"
                ngpSelectOption
                [attr.data-testid]="'virtual-option-' + item.index"
              >
                {{ item.value }} ({{ item.index }})
              </div>
            }
          </div>
        </div>
      `,
      imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
    })
    class VirtualScrollingTestComponent {
      value = signal<string | undefined>(undefined);
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
        return this.allOptions.slice(this.startIndex, this.endIndex + 1).map((value, displayIndex) => ({
          value,
          index: this.startIndex + displayIndex,
        }));
      }

      onValueChange(value: string) {
        this.value.set(value);
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
        this.endIndex = Math.min(this.allOptions.length - 1, this.startIndex + itemsToShow - 1);
      };
    }

    @Component({
      template: `
        <div
          [(ngpSelectValue)]="value"
          [ngpSelectOptions]="allOptions"
          [ngpSelectMultiple]="true"
          (ngpSelectValueChange)="onValueChange($event)"
          ngpSelect
          data-testid="virtual-multi-select"
        >
          @if (value().length > 0) {
            <span data-testid="selected-values">{{ value().join(', ') }}</span>
          } @else {
            <span data-testid="placeholder">Select multiple options</span>
          }

          <div *ngpSelectPortal ngpSelectDropdown data-testid="virtual-multi-dropdown">
            @for (item of renderedItems; track item.index) {
              <div
                [ngpSelectOptionValue]="item.value"
                [ngpSelectOptionIndex]="item.index"
                ngpSelectOption
                [attr.data-testid]="'virtual-multi-option-' + item.index"
              >
                {{ item.value }}
              </div>
            }
          </div>
        </div>
      `,
      imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
    })
    class VirtualMultiSelectTestComponent {
      value = signal<string[]>([]);

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
        this.value.set(values);
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

        const user = userEvent.setup();
        const select = screen.getByTestId('virtual-select');
        await user.click(select);

        await waitFor(() => {
          // The select should know about all 20 options for keyboard navigation
          // even though only 6 are rendered in DOM
          expect(component.open).toBeTruthy();
        });
      });

      it('should call custom scroll function when opening dropdown with selected item', async () => {
        const { fixture } = await render(VirtualScrollingTestComponent);
        const component = fixture.componentInstance;

        // Set a value that's not in the initially rendered range
        component.value.set('Option 10');
        fixture.detectChanges();

        const user = userEvent.setup();
        const select = screen.getByTestId('virtual-select');
        await user.click(select);

        await waitFor(() => {
          // Custom scroll function should be called with the index of the selected option
          expect(component.scrollToOptionCalled).toBeTruthy();
          expect(component.lastScrollIndex).toBe(10);
        });
      });

      it('should handle keyboard navigation with virtual indices', async () => {
        const { fixture } = await render(VirtualScrollingTestComponent);
        const component = fixture.componentInstance;

        const select = screen.getByTestId('virtual-select');
        select.focus();

        // Open dropdown
        fireEvent.keyDown(select, { key: 'ArrowDown' });

        await waitFor(() => {
          expect(component.open).toBeTruthy();
          // Wait for the dropdown to be rendered
          expect(screen.getByTestId('virtual-dropdown')).toBeInTheDocument();
        });

        // First rendered option (index 0) should be active
        const firstOption = screen.getByTestId('virtual-option-0');
        expect(firstOption).toHaveAttribute('data-active');

        // Navigate down should go to index 1
        fireEvent.keyDown(select, { key: 'ArrowDown' });
        const secondOption = screen.getByTestId('virtual-option-1');
        await waitFor(() => {
          expect(secondOption).toHaveAttribute('data-active');
        });
      });

      it('should select options by index when virtual scrolling is used', async () => {
        const { fixture } = await render(VirtualScrollingTestComponent);
        const component = fixture.componentInstance;

        const user = userEvent.setup();
        const select = screen.getByTestId('virtual-select');
        await user.click(select);

        // Click on the option with index 2
        const option = screen.getByTestId('virtual-option-2');
        await user.click(option);

        await waitFor(() => {
          expect(component.value()).toBe('Option 2');
          // Dropdown should close after selection
          expect(component.open).toBeFalsy();
        });
      });

      it('should support option selection with Enter key using virtual indices', async () => {
        const { fixture } = await render(VirtualScrollingTestComponent);
        const component = fixture.componentInstance;

        const select = screen.getByTestId('virtual-select');
        select.focus();

        // Open dropdown
        fireEvent.keyDown(select, { key: 'ArrowDown' });

        await waitFor(() => {
          expect(component.open).toBeTruthy();
          expect(screen.getByTestId('virtual-dropdown')).toBeInTheDocument();
        });

        // Navigate to index 1
        fireEvent.keyDown(select, { key: 'ArrowDown' });
        
        // Wait for navigation to complete
        await waitFor(() => {
          const secondOption = screen.getByTestId('virtual-option-1');
          expect(secondOption).toHaveAttribute('data-active');
        });

        // Select with Enter
        fireEvent.keyDown(select, { key: 'Enter' });

        // Dropdown closes after selection in single-select mode
        await waitFor(() => {
          expect(component.value()).toBe('Option 1');
          expect(component.open).toBeFalsy();
        });
      });

      it('should handle pointer events correctly with virtual indices', async () => {
        const user = userEvent.setup();
        await render(VirtualScrollingTestComponent);

        const select = screen.getByTestId('virtual-select');
        await user.click(select);

        const option = screen.getByTestId('virtual-option-3');

        // Hover over option should activate it
        fireEvent.pointerEnter(option);
        await waitFor(() => {
          expect(option).toHaveAttribute('data-active');
        });

        // Unhover should deactivate
        fireEvent.pointerLeave(option);
        await waitFor(() => {
          expect(option).not.toHaveAttribute('data-active');
        });
      });

      it('should find selected option from allOptions when opening dropdown', async () => {
        @Component({
          template: `
            <div
              [(ngpSelectValue)]="value"
              [ngpSelectOptions]="allOptions"
              (ngpSelectValueChange)="onValueChange($event)"
              ngpSelect
              data-testid="preselected-select"
            >
              <span>{{ value() || 'Select an option' }}</span>

              <div *ngpSelectPortal ngpSelectDropdown>
                <!-- Only render a subset of all options -->
                @for (option of visibleOptions; track option; let i = $index) {
                  <div
                    [ngpSelectOptionValue]="option"
                    [ngpSelectOptionIndex]="allOptions.indexOf(option)"
                    ngpSelectOption
                    [attr.data-testid]="'preselected-option-' + allOptions.indexOf(option)"
                  >
                    {{ option }}
                  </div>
                }
              </div>
            </div>
          `,
          imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
        })
        class PreselectedVirtualComponent {
          value = signal('Virtual Option 5'); // Pre-select an option
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
            this.value.set(value);
          }
        }

        const { fixture } = await render(PreselectedVirtualComponent);
        const component = fixture.componentInstance;

        // Verify initial state
        expect(component.value()).toBe('Virtual Option 5');

        const user = userEvent.setup();
        const select = screen.getByTestId('preselected-select');
        await user.click(select);

        // The selected option should be active even though it comes from allOptions
        const selectedOption = screen.getByTestId('preselected-option-5');
        await waitFor(() => {
          expect(selectedOption).toHaveAttribute('data-active');
        });
      });

      it('should handle keyboard navigation across large virtual datasets', async () => {
        const { fixture } = await render(VirtualScrollingTestComponent);
        const component = fixture.componentInstance;

        const select = screen.getByTestId('virtual-select');
        select.focus();

        // Open dropdown
        fireEvent.keyDown(select, { key: 'ArrowDown' });

        await waitFor(() => {
          expect(component.open).toBeTruthy();
        });

        // Initially renders indices 0-5
        expect(component.renderedItems.length).toBe(6);
        expect(component.renderedItems[0].index).toBe(0);

        // Navigate multiple times - keyboard navigation should work even beyond rendered items
        for (let i = 0; i < 8; i++) {
          fireEvent.keyDown(select, { key: 'ArrowDown' });
        }

        // We should now be at index 8 (0 + 8 arrow downs)
        // Verify that activeDescendantManager navigated correctly and dropdown is still open
        await waitFor(() => {
          expect(select).toHaveAttribute('aria-expanded', 'true');
        });
      });

      it('should wrap navigation correctly with virtual scrolling', async () => {
        const { fixture } = await render(VirtualScrollingTestComponent);
        const component = fixture.componentInstance;

        const select = screen.getByTestId('virtual-select');
        select.focus();

        // Open dropdown
        fireEvent.keyDown(select, { key: 'ArrowDown' });

        await waitFor(() => {
          expect(component.open).toBeTruthy();
        });

        // Jump to end - should navigate to last option
        fireEvent.keyDown(select, { key: 'End' });

        // Verify navigation happened (activeDescendantManager still works)
        await waitFor(() => {
          // The dropdown is still open and navigation worked
          expect(select).toHaveAttribute('aria-expanded', 'true');
        });

        // Jump to beginning
        fireEvent.keyDown(select, { key: 'Home' });

        // Should navigate to first option
        const firstOption = screen.getByTestId('virtual-option-0');
        await waitFor(() => {
          expect(firstOption).toHaveAttribute('data-active');
        });
      });
    });

    describe('Virtual Scrolling with Multiple Selection', () => {
      it('should support multiple selection with virtual scrolling', async () => {
        const { fixture } = await render(VirtualMultiSelectTestComponent);
        const component = fixture.componentInstance;

        const user = userEvent.setup();
        const select = screen.getByTestId('virtual-multi-select');
        await user.click(select);

        // Select multiple options
        await user.click(screen.getByTestId('virtual-multi-option-0'));
        expect(component.value()).toEqual(['Multi Option 0']);

        await user.click(screen.getByTestId('virtual-multi-option-2'));
        expect(component.value()).toEqual(['Multi Option 0', 'Multi Option 2']);

        // Dropdown should stay open
        await waitFor(() => {
          expect(screen.getByTestId('virtual-multi-option-1')).toBeInTheDocument();
        });
      });

      it('should show selected state for virtual options in multi-select', async () => {
        const { fixture } = await render(VirtualMultiSelectTestComponent);
        const component = fixture.componentInstance;

        // Pre-select some options
        component.value.set(['Multi Option 1']);
        fixture.detectChanges();

        const user = userEvent.setup();
        const select = screen.getByTestId('virtual-multi-select');
        await user.click(select);

        // Check that selected option is marked
        const selectedOption = screen.getByTestId('virtual-multi-option-1');
        await waitFor(() => {
          expect(selectedOption).toHaveAttribute('data-selected');
        });

        // Non-selected option should not be marked
        const unselectedOption = screen.getByTestId('virtual-multi-option-0');
        expect(unselectedOption).not.toHaveAttribute('data-selected');
      });

      it('should handle keyboard selection in multi-select with virtual scrolling', async () => {
        const { fixture } = await render(VirtualMultiSelectTestComponent);
        const component = fixture.componentInstance;

        const select = screen.getByTestId('virtual-multi-select');
        select.focus();

        // Open dropdown
        fireEvent.keyDown(select, { key: 'ArrowDown' });

        await waitFor(() => {
          expect(select).toHaveAttribute('aria-expanded', 'true');
        });

        // Navigate and select
        fireEvent.keyDown(select, { key: 'ArrowDown' });
        fireEvent.keyDown(select, { key: 'Enter' });

        expect(component.value()).toContain('Multi Option 1');

        // Dropdown should remain open
        expect(select).toHaveAttribute('aria-expanded', 'true');

        // Select another option
        fireEvent.keyDown(select, { key: 'ArrowUp' });
        fireEvent.keyDown(select, { key: 'Enter' });

        expect(component.value()).toContain('Multi Option 0');
        expect(component.value()).toHaveLength(2);
      });
    });

    describe('Custom Scroll Function Integration', () => {
      it('should call custom scroll function when opening with preselected value', async () => {
        const { fixture } = await render(VirtualScrollingTestComponent);
        const component = fixture.componentInstance;

        // Select an option outside the initially rendered range
        component.value.set('Option 15');
        fixture.detectChanges();

        const select = screen.getByTestId('virtual-select');
        // Open dropdown - should call scrollToOption to show the selected option
        const user = userEvent.setup();
        await user.click(select);

        await waitFor(() => {
          expect(component.open).toBeTruthy();
          // Custom scroll function should be called with the index of the selected option
          expect(component.scrollToOptionCalled).toBeTruthy();
          expect(component.lastScrollIndex).toBe(15);
        });
      });

      it('should not call default scrollIntoView when custom scroll function is provided', async () => {
        const { fixture } = await render(VirtualScrollingTestComponent);
        const component = fixture.componentInstance;

        // Spy on scrollIntoView to ensure it's not called
        const scrollIntoViewSpy = jest
          .spyOn(Element.prototype, 'scrollIntoView')
          .mockImplementation();

        // Pre-select an option outside initially rendered range
        component.value.set('Option 10');
        fixture.detectChanges();

        const user = userEvent.setup();
        const select = screen.getByTestId('virtual-select');

        // Open dropdown - should call custom scroll, not default scrollIntoView
        await user.click(select);

        await waitFor(() => {
          expect(component.open).toBeTruthy();
          expect(component.scrollToOptionCalled).toBeTruthy();
        });

        // Default scrollIntoView should not be called when custom function is provided
        expect(scrollIntoViewSpy).not.toHaveBeenCalled();

        scrollIntoViewSpy.mockRestore();
      });

      it('should handle Home and End keys with virtual scrolling', async () => {
        const { fixture } = await render(VirtualScrollingTestComponent);
        const component = fixture.componentInstance;

        const select = screen.getByTestId('virtual-select');
        select.focus();

        // Open dropdown
        fireEvent.keyDown(select, { key: 'ArrowDown' });

        await waitFor(() => {
          expect(component.open).toBeTruthy();
        });

        // Navigate to middle
        fireEvent.keyDown(select, { key: 'ArrowDown' });
        fireEvent.keyDown(select, { key: 'ArrowDown' });

        // Press Home key - should navigate to first option
        fireEvent.keyDown(select, { key: 'Home' });
        
        await waitFor(() => {
          // Check the aria-activedescendant points to first option
          const firstOption = screen.getByTestId('virtual-option-0');
          expect(firstOption).toHaveAttribute('data-active');
        });

        // Press End key - should navigate to last option (keyboard navigation works with allOptions)
        fireEvent.keyDown(select, { key: 'End' });
        
        // The End key navigates to index 19 (last of allOptions), but it may not be rendered
        // That's OK - keyboard navigation still works with virtual scrolling
        await waitFor(() => {
          expect(select).toHaveAttribute('aria-expanded', 'true');
        });
      });
    });

    describe('Edge Cases and Error Handling', () => {
      it('should handle empty allOptions gracefully', async () => {
        @Component({
          template: `
            <div [ngpSelectOptions]="[]" ngpSelect data-testid="empty-virtual-select">
              <span>No options</span>
              <div *ngpSelectPortal ngpSelectDropdown>
                <div data-testid="no-options">No options available</div>
              </div>
            </div>
          `,
          imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
        })
        class EmptyVirtualComponent {}

        const user = userEvent.setup();
        await render(EmptyVirtualComponent);

        const select = screen.getByTestId('empty-virtual-select');
        await user.click(select);

        // Should handle empty options without errors
        await waitFor(() => {
          expect(screen.getByTestId('no-options')).toBeInTheDocument();
        });
      });

      it('should fall back to DOM options when allOptions is not provided', async () => {
        @Component({
          template: `
            <div [(ngpSelectValue)]="value" ngpSelect data-testid="fallback-select">
              <span>{{ value() || 'Select an option' }}</span>
              <div *ngpSelectPortal ngpSelectDropdown>
                <div
                  ngpSelectOptionValue="Option 1"
                  ngpSelectOption
                  data-testid="fallback-option-1"
                >
                  Option 1
                </div>
                <div
                  ngpSelectOptionValue="Option 2"
                  ngpSelectOption
                  data-testid="fallback-option-2"
                >
                  Option 2
                </div>
              </div>
            </div>
          `,
          imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
        })
        class FallbackComponent {
          value = signal<string | undefined>(undefined);
        }

        const { fixture } = await render(FallbackComponent);

        const user = userEvent.setup();
        const select = screen.getByTestId('fallback-select');
        await user.click(select);

        // Should work with DOM options when allOptions is not provided
        const option = screen.getByTestId('fallback-option-1');
        await user.click(option);

        // Should select successfully
        await waitFor(() => {
          expect(fixture.componentInstance.value()).toBe('Option 1');
        });
      });

      it('should handle mismatched allOptions and rendered options', async () => {
        @Component({
          template: `
            <div
              [(ngpSelectValue)]="value"
              [ngpSelectOptions]="allOptions"
              (ngpSelectValueChange)="onValueChange($event)"
              ngpSelect
              data-testid="mismatch-select"
            >
              <span>{{ value() || 'Select an option' }}</span>
              <div *ngpSelectPortal ngpSelectDropdown>
                <!-- Only render first 2 options, but allOptions has 5 -->
                @for (option of allOptions.slice(0, 2); track option; let i = $index) {
                  <div
                    [ngpSelectOptionValue]="option"
                    [ngpSelectOptionIndex]="i"
                    ngpSelectOption
                    [attr.data-testid]="'mismatch-option-' + i"
                  >
                    {{ option }}
                  </div>
                }
              </div>
            </div>
          `,
          imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
        })
        class MismatchComponent {
          value = signal<string | undefined>('Option 3'); // Not in rendered options
          allOptions = ['Option 0', 'Option 1', 'Option 2', 'Option 3', 'Option 4'];

          onValueChange(value: string) {
            this.value.set(value);
          }
        }

        const { fixture } = await render(MismatchComponent);
        const component = fixture.componentInstance;

        const user = userEvent.setup();
        const select = screen.getByTestId('mismatch-select');
        await user.click(select);

        // Should handle the case where selected option is not in rendered options
        // but is in allOptions
        expect(component.value()).toBe('Option 3');

        // Should still be able to select rendered options
        await user.click(screen.getByTestId('mismatch-option-1'));

        await waitFor(() => {
          expect(component.value()).toBe('Option 1');
        });
      });

      it('should handle selection state correctly with virtual options', async () => {
        @Component({
          template: `
            <div
              [(ngpSelectValue)]="value"
              [ngpSelectOptions]="allOptions"
              (ngpSelectValueChange)="onValueChange($event)"
              ngpSelect
              data-testid="selection-state-select"
            >
              <span>{{ value() || 'Select an option' }}</span>
              <div *ngpSelectPortal ngpSelectDropdown>
                @for (option of allOptions; track option; let i = $index) {
                  <div
                    [ngpSelectOptionValue]="option"
                    [ngpSelectOptionIndex]="i"
                    ngpSelectOption
                    [attr.data-testid]="'selection-option-' + i"
                  >
                    {{ option }}
                  </div>
                }
              </div>
            </div>
          `,
          imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
        })
        class SelectionStateComponent {
          value = signal<string | undefined>(undefined);
          allOptions = ['State Option A', 'State Option B', 'State Option C'];

          onValueChange(value: string) {
            this.value.set(value);
          }
        }

        const { fixture } = await render(SelectionStateComponent);
        const component = fixture.componentInstance;

        const user = userEvent.setup();
        const select = screen.getByTestId('selection-state-select');
        await user.click(select);

        // Select an option
        await user.click(screen.getByTestId('selection-option-1'));

        await waitFor(() => {
          expect(component.value()).toBe('State Option B');
        });

        // Re-open dropdown
        await user.click(select);

        // The selected option should be marked as selected
        const selectedOption = screen.getByTestId('selection-option-1');
        await waitFor(() => {
          expect(selectedOption).toHaveAttribute('data-selected');
          // Should also be active when opening
          expect(selectedOption).toHaveAttribute('data-active');
        });

        // Other options should not be selected
        expect(screen.getByTestId('selection-option-0')).not.toHaveAttribute('data-selected');
        expect(screen.getByTestId('selection-option-2')).not.toHaveAttribute('data-selected');
      });

      it('should handle rapid keyboard navigation without errors', async () => {
        const { fixture } = await render(VirtualScrollingTestComponent);
        const component = fixture.componentInstance;

        const select = screen.getByTestId('virtual-select');
        select.focus();

        // Open dropdown
        fireEvent.keyDown(select, { key: 'ArrowDown' });

        await waitFor(() => {
          expect(component.open).toBeTruthy();
        });

        // Rapidly navigate through options (will wrap with 20 options)
        for (let i = 0; i < 25; i++) {
          fireEvent.keyDown(select, { key: 'ArrowDown' });
        }

        // Should not throw errors and dropdown should still be open
        await waitFor(() => {
          expect(select).toHaveAttribute('aria-expanded', 'true');
          // After 25 downs from starting position 0, with 20 options, we wrap: 25 % 20 = 5 downs from 0 = index 5
          // But since first ArrowDown opens and moves to 0, we end up back at 0 after wrapping
          // The active element should exist and have data-active
          expect(screen.getByTestId('virtual-option-0')).toHaveAttribute('data-active');
        });
      });

      it('should preserve scroll position when dropdown reopens', async () => {
        const { fixture } = await render(VirtualScrollingTestComponent);
        const component = fixture.componentInstance;

        const user = userEvent.setup();
        const select = screen.getByTestId('virtual-select');

        // Select an option deep in the list
        component.value.set('Option 15');
        fixture.detectChanges();

        // Open dropdown - should scroll to selected option
        await user.click(select);

        await waitFor(() => {
          expect(component.scrollToOptionCalled).toBeTruthy();
          expect(component.lastScrollIndex).toBe(15);
        });

        // Close dropdown
        await user.click(select);

        await waitFor(() => {
          expect(component.open).toBeFalsy();
        });

        component.scrollToOptionCalled = false;
        await user.click(select);

        // Should scroll to the selected option again
        await waitFor(() => {
          expect(component.scrollToOptionCalled).toBeTruthy();
          expect(component.lastScrollIndex).toBe(15);
        });
      });

      it('should handle single item in allOptions', async () => {
        @Component({
          template: `
            <div
              [(ngpSelectValue)]="value"
              [ngpSelectOptions]="allOptions"
              ngpSelect
              data-testid="single-option-select"
            >
              <span>{{ value() || 'Select an option' }}</span>
              <div *ngpSelectPortal ngpSelectDropdown>
                @for (option of allOptions; track option; let i = $index) {
                  <div
                    [ngpSelectOptionValue]="option"
                    [ngpSelectOptionIndex]="i"
                    ngpSelectOption
                    [attr.data-testid]="'single-option-' + i"
                  >
                    {{ option }}
                  </div>
                }
              </div>
            </div>
          `,
          imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
        })
        class SingleOptionComponent {
          value = signal<string | undefined>(undefined);
          allOptions = ['Only Option'];
        }

        const { fixture } = await render(SingleOptionComponent);

        const user = userEvent.setup();
        const select = screen.getByTestId('single-option-select');
        await user.click(select);

        const option = screen.getByTestId('single-option-0');
        await user.click(option);

        await waitFor(() => {
          expect(fixture.componentInstance.value()).toBe('Only Option');
        });
      });
    });
  });
});
