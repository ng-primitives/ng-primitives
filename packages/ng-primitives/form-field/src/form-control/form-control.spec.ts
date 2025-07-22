import { render } from '@testing-library/angular';
import { NgpFormControl } from './form-control';

describe('NgpFormControl', () => {
  it('should initialise correctly', async () => {
    await render(`<div ngpFormControl></div>`, {
      imports: [NgpFormControl],
    });
  });

  describe('disabled attribute', () => {
    it('should not apply disabled attribute on div even if disabled is true', async () => {
      const { getByTestId } = await render(
        `<div ngpFormControl data-testid="control" [ngpFormControlDisabled]="true"></div>`,
        {
          imports: [NgpFormControl],
        },
      );
      const control = getByTestId('control');
      expect(control).not.toHaveAttribute('disabled');
    });

    it('should not apply disabled attribute on custom element even if disabled is true', async () => {
      const { getByTestId } = await render(
        `<custom-element ngpFormControl data-testid="control" [ngpFormControlDisabled]="true"></custom-element>`,
        {
          imports: [NgpFormControl],
        },
      );
      const control = getByTestId('control');
      expect(control).not.toHaveAttribute('disabled');
    });

    ['button', 'fieldset', 'optgroup', 'option', 'select', 'textarea', 'input'].forEach(element => {
      it(`should apply disabled attribute on <${element}> when disabled is true`, async () => {
        const markup =
          element === 'input'
            ? `<input ngpFormControl data-testid="control" [ngpFormControlDisabled]="true" />`
            : `<${element} ngpFormControl data-testid="control" [ngpFormControlDisabled]="true"></${element}>`;
        const { getByTestId } = await render(markup, {
          imports: [NgpFormControl],
        });
        const control = getByTestId('control');
        expect(control).toHaveAttribute('disabled');
      });

      it(`should not apply disabled attribute on <${element}> when disabled is false`, async () => {
        const markup =
          element === 'input'
            ? `<input ngpFormControl data-testid="control" [ngpFormControlDisabled]="false" />`
            : `<${element} ngpFormControl data-testid="control" [ngpFormControlDisabled]="false"></${element}>`;
        const { getByTestId } = await render(markup, {
          imports: [NgpFormControl],
        });
        const control = getByTestId('control');
        expect(control).not.toHaveAttribute('disabled');
      });

      it(`should not apply disabled attribute on <${element}> by default`, async () => {
        const markup =
          element === 'input'
            ? `<input ngpFormControl data-testid="control" />`
            : `<${element} ngpFormControl data-testid="control"></${element}>`;
        const { getByTestId } = await render(markup, {
          imports: [NgpFormControl],
        });
        const control = getByTestId('control');
        expect(control).not.toHaveAttribute('disabled');
      });
    });
  });
});
