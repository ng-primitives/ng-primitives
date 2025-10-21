import { RenderResult, fireEvent, render } from '@testing-library/angular';
import { NgpSwitch } from './switch';

describe('NgpSwitch', () => {
  let container: RenderResult<unknown, unknown>;
  let switchElement: HTMLElement;
  let checkedChange: jest.Mock;

  beforeEach(async () => {
    checkedChange = jest.fn();

    container = await render(
      `<div
        ngpSwitch
        [(ngpSwitchChecked)]="checked"
        (ngpSwitchCheckedChange)="checkedChange($event)"
        [ngpSwitchDisabled]="disabled">
      </div>`,
      {
        imports: [NgpSwitch],
        componentProperties: {
          checked: false,
          disabled: false,
          checkedChange,
        },
      },
    );

    switchElement = container.getByRole('switch');
  });

  describe('switch', () => {
    it('should have a role of switch', () => {
      expect(switchElement.getAttribute('role')).toBe('switch');
    });

    it('should have a tabindex of 0', () => {
      expect(switchElement.getAttribute('tabindex')).toBe('0');
    });

    it('should set the tabindex to -1 when disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true } });
      expect(switchElement.getAttribute('tabindex')).toBe('-1');
    });

    it('should not have the aria-checked attribute when unchecked', () => {
      expect(switchElement).toHaveAttribute('aria-checked', 'false');
    });

    it('should set the aria-checked attribute to "true" when checked', async () => {
      await container.rerender({ componentProperties: { checked: true } });
      container.detectChanges();
      expect(switchElement.getAttribute('aria-checked')).toBe('true');
    });

    it('should not have the aria-disabled attribute when not disabled', () => {
      expect(switchElement).toHaveAttribute('aria-disabled', 'false');
    });

    it('should set the aria-disabled attribute to "true" when disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true } });
      container.detectChanges();
      expect(switchElement).toHaveAttribute('aria-disabled', 'true');
    });

    it('should set the data-checked attribute when checked', async () => {
      await container.rerender({ componentProperties: { checked: true } });
      container.detectChanges();
      expect(switchElement).toHaveAttribute('data-checked');
    });

    it('should not have the data-checked attribute when unchecked', () => {
      expect(switchElement).not.toHaveAttribute('data-checked');
    });

    it('should set the data-disabled attribute when disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true } });
      container.detectChanges();
      expect(switchElement).toHaveAttribute('data-disabled');
    });

    it('should not have the data-disabled attribute when not disabled', () => {
      expect(switchElement).not.toHaveAttribute('data-disabled');
    });

    it('should have a unique id', () => {
      const id = switchElement.getAttribute('id');
      expect(id).toBeTruthy();
      expect(id).toMatch(/^ngp-switch-\d+$/);
    });

    it('should emit the checkedChange event when clicked', () => {
      fireEvent.click(switchElement);
      expect(checkedChange).toHaveBeenCalledWith(true);
    });

    it('should not emit the checkedChange event when clicked and disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true } });
      fireEvent.click(switchElement);
      expect(checkedChange).not.toHaveBeenCalled();
    });

    it('should emit the checkedChange event when the space key is pressed', () => {
      fireEvent.keyDown(switchElement, { key: ' ' });
      expect(checkedChange).toHaveBeenCalledWith(true);
    });

    it('should not emit the checkedChange event when the space key is pressed and disabled', async () => {
      await container.rerender({ componentProperties: { disabled: true } });
      fireEvent.keyDown(switchElement, { key: ' ' });
      expect(checkedChange).not.toHaveBeenCalled();
    });

    it('should toggle from checked to unchecked when clicked', async () => {
      await container.rerender({ componentProperties: { checked: true, checkedChange } });
      fireEvent.click(switchElement);
      expect(checkedChange).toHaveBeenCalledWith(false);
    });

    it('should toggle from unchecked to checked when clicked', () => {
      fireEvent.click(switchElement);
      expect(checkedChange).toHaveBeenCalledWith(true);
    });

    it('should not emit the checkedChange event when the enter key is pressed', () => {
      fireEvent.keyDown(switchElement, { key: 'Enter' });
      expect(checkedChange).not.toHaveBeenCalled();
    });

    it('should expose toggle method that works correctly', async () => {
      // Get the directive instance through the debug element
      const directive = container.debugElement.children[0].injector.get(NgpSwitch);

      // Call toggle method directly
      directive.toggle();
      expect(checkedChange).toHaveBeenCalledWith(true);

      // Reset the mock
      checkedChange.mockReset();

      // Update the checked state and call toggle again
      await container.rerender({ componentProperties: { checked: true, checkedChange } });
      directive.toggle();
      expect(checkedChange).toHaveBeenCalledWith(false);
    });
  });
});

describe('NgpSwitch on button element', () => {
  let container: RenderResult<unknown, unknown>;
  let switchElement: HTMLElement;
  let checkedChange: jest.Mock;

  beforeEach(async () => {
    checkedChange = jest.fn();

    container = await render(
      `<button
        ngpSwitch
        [(ngpSwitchChecked)]="checked"
        (ngpSwitchCheckedChange)="checkedChange($event)"
        [ngpSwitchDisabled]="disabled">
      </button>`,
      {
        imports: [NgpSwitch],
        componentProperties: {
          checked: false,
          disabled: false,
          checkedChange,
        },
      },
    );

    switchElement = container.getByRole('switch');
  });

  it('should have type="button" when used on a button element', () => {
    expect(switchElement.getAttribute('type')).toBe('button');
  });

  it('should set the disabled attribute when disabled on button element', async () => {
    await container.rerender({ componentProperties: { disabled: true } });
    container.detectChanges();
    expect(switchElement.hasAttribute('disabled')).toBe(true);
  });

  it('should not have the disabled attribute when not disabled on button element', () => {
    expect(switchElement).not.toHaveAttribute('disabled');
  });
});
