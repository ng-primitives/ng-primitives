import { fireEvent, render } from '@testing-library/angular';
import { NgpSwitch } from './switch';

describe('NgpSwitch', () => {
  it('should render with generated id and default unchecked state', async () => {
    const { getByRole } = await render(`<button ngpSwitch></button>`, { imports: [NgpSwitch] });
    const button = getByRole('switch');

    expect(button.id).toMatch(/^ngp-switch/);
    expect(button).toHaveAttribute('aria-checked', 'false');
    expect(button).not.toHaveAttribute('data-checked');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('tabindex', '0');
  });

  it('should reflect a provided id and initial checked state', async () => {
    const { getByRole } = await render(
      `<button ngpSwitch id="custom-id" ngpSwitchChecked="true"></button>`,
      { imports: [NgpSwitch] },
    );
    const button = getByRole('switch');

    expect(button.id).toBe('custom-id');
    expect(button).toHaveAttribute('aria-checked', 'true');
    expect(button).toHaveAttribute('data-checked', '');
  });

  it('should toggle on click when enabled and emit changes', async () => {
    const checkedChange = jest.fn();
    const { getByRole } = await render(
      `<button ngpSwitch (ngpSwitchCheckedChange)="checkedChange($event)"></button>`,
      {
        imports: [NgpSwitch],
        componentProperties: { checkedChange },
      },
    );

    const button = getByRole('switch');
    fireEvent.click(button);

    expect(checkedChange).toHaveBeenCalledWith(true);
    expect(button).toHaveAttribute('aria-checked', 'true');
    expect(button).toHaveAttribute('data-checked', '');
  });

  it('should not toggle or emit when disabled', async () => {
    const checkedChange = jest.fn();
    const { getByRole, rerender } = await render(
      `<button ngpSwitch [ngpSwitchDisabled]="disabled" (ngpSwitchCheckedChange)="checkedChange($event)"></button>`,
      {
        imports: [NgpSwitch],
        componentProperties: { disabled: true, checkedChange },
      },
    );

    const button = getByRole('switch');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-disabled', '');
    expect(button).toHaveAttribute('tabindex', '-1');

    fireEvent.click(button);
    expect(checkedChange).not.toHaveBeenCalled();

    await rerender({ componentProperties: { disabled: false, checkedChange } });
    fireEvent.click(button);
    expect(checkedChange).toHaveBeenCalledWith(true);
  });

  it('should toggle on space key when element is not a button', async () => {
    const checkedChange = jest.fn();
    const { getByRole } = await render(
      `<div ngpSwitch tabindex="0" (ngpSwitchCheckedChange)="checkedChange($event)"></div>`,
      {
        imports: [NgpSwitch],
        componentProperties: { checkedChange },
      },
    );

    const switchDiv = getByRole('switch');
    fireEvent.keyDown(switchDiv, { key: ' ' });

    expect(checkedChange).toHaveBeenCalledWith(true);
    expect(switchDiv).toHaveAttribute('aria-checked', 'true');
  });

  it('should expose disabled state via aria and data attributes', async () => {
    const { getByRole } = await render(`<button ngpSwitch ngpSwitchDisabled></button>`, {
      imports: [NgpSwitch],
    });

    const button = getByRole('switch');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveAttribute('data-disabled', '');
    expect(button).toHaveAttribute('disabled', '');
    expect(button).toHaveAttribute('tabindex', '-1');
  });
});
