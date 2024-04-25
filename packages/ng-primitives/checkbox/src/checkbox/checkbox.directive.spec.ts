import { RenderResult, render } from '@testing-library/angular';
import { NgpCheckboxIndicatorDirective } from '../checkbox-indicator/checkbox-indicator.directive';
import { NgpCheckboxInputDirective } from '../checkbox-input/checkbox-input.directive';
import { NgpCheckboxLabelDirective } from '../checkbox-label/checkbox-label.directive';
import { NgpCheckboxDirective } from './checkbox.directive';

const imports = [
  NgpCheckboxDirective,
  NgpCheckboxInputDirective,
  NgpCheckboxLabelDirective,
  NgpCheckboxIndicatorDirective,
];

describe('NgpCheckboxDirective', () => {
  let container: RenderResult<unknown, unknown>;
  let checkbox: HTMLElement;
  let input: HTMLInputElement;
  let label: HTMLLabelElement;
  let indicator: HTMLElement;
  let checked: jest.Mock;

  beforeEach(async () => {
    container = await render(
      `<div
        ngpCheckbox
        [ngpCheckboxChecked]="checked"
        (ngpCheckboxCheckedChange)="checked.emit($event)"
        [ngpCheckboxDisabled]="disabled">

        <input ngpCheckboxInput data-testid="checkbox-input" />
        <span ngpCheckboxIndicator data-testid="checkbox-indicator"></span>
        <label ngpCheckboxLabel>Accept terms and conditions</label>
      </div>`,
      {
        imports,
        componentInputs: {
          checked: false,
          disabled: false,
        },
        componentOutputs: {
          checked,
        },
      },
    );

    checkbox = container.getByRole('checkbox');
    input = container.getByTestId('checkbox-input') as HTMLInputElement;
    label = container.getByText('Accept terms and conditions') as HTMLLabelElement;
    indicator = container.getByTestId('checkbox-indicator');
  });

  describe('checkbox', () => {
    it('should generate a unique id', () => {
      expect(checkbox.id).toMatch(/^ngp-checkbox-\d+$/);
    });

    it('should allow a user to set the id', async () => {
      container = await render(`<div ngpCheckbox id="custom-id"></div>`, { imports });
      checkbox = container.getByRole('checkbox');
      expect(checkbox.id).toBe('custom-id');
    });

    it('should have a role of checkbox', () => {
      expect(checkbox.getAttribute('role')).toBe('checkbox');
    });

    it('should have a tabindex of 0', () => {
      expect(checkbox.getAttribute('tabindex')).toBe('0');
    });

    it('should set the tabindex to -1 when disabled', async () => {
      await container.rerender({ componentInputs: { disabled: true } });
      expect(checkbox.getAttribute('tabindex')).toBe('-1');
    });
  });

  // describe('input', () => {});

  // describe('label', () => {});

  // describe('indicator', () => {});
});
