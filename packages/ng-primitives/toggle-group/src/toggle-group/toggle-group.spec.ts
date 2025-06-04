import { fireEvent, render } from '@testing-library/angular';
import { NgpToggleGroupItem } from '../toggle-group-item/toggle-group-item';
import { NgpToggleGroup } from './toggle-group';

describe('NgpToggleGroup', () => {
  it('should set the default orientation', async () => {
    const { getByRole } = await render(
      `
      <div ngpToggleGroup>
        <div ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
        <div ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
      </div>
      `,
      {
        imports: [NgpToggleGroup, NgpToggleGroupItem],
      },
    );
    const group = getByRole('group');
    expect(group.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('should set the orientation to vertical', async () => {
    const { getByRole } = await render(
      `
      <div ngpToggleGroup ngpToggleGroupOrientation="vertical">
        <div ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
        <div ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
      </div>
      `,
      {
        imports: [NgpToggleGroup, NgpToggleGroupItem],
      },
    );
    const group = getByRole('group');
    expect(group.getAttribute('data-orientation')).toBe('vertical');
  });

  describe('Single', () => {
    it('should have the expected defaults', async () => {
      const { getByRole } = await render(
        `
        <div ngpToggleGroup>
          <div ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const group = getByRole('group');
      expect(group.getAttribute('data-type')).toBe('single');
      expect(group.getAttribute('data-orientation')).toBe('horizontal');
    });

    it('should allow an initial value', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupValue="option-1">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      expect(item1).toHaveAttribute('data-selected');
      expect(item2).not.toHaveAttribute('data-selected');
    });

    it('should allow deselection', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupAllowDeselection="true">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      item1.click();
      expect(item1).not.toHaveAttribute('data-selected');
    });

    it('should not allow deselection when disabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupAllowDeselection="false">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(item1).toHaveAttribute('data-selected');
    });

    it('should emit valueChange on selection', async () => {
      const onValueChange = jest.fn();
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup (ngpToggleGroupValueChange)="onValueChange($event)">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
          componentProperties: {
            onValueChange,
          },
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(onValueChange).toHaveBeenCalledWith(['option-1']);
      fireEvent.click(item1); // Deselect
      expect(onValueChange).toHaveBeenCalledWith([]);
    });

    it('should not allow selection when disabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupDisabled="true">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(item1).not.toHaveAttribute('data-selected');
    });
  });

  describe('Multiple', () => {
    it('should have the expected defaults', async () => {
      const { getByRole } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupType="multiple">
          <div ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const group = getByRole('group');
      expect(group.getAttribute('data-type')).toBe('multiple');
      expect(group.getAttribute('data-orientation')).toBe('horizontal');
    });

    it('should allow multiple selections', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupType="multiple">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      fireEvent.click(item1);
      expect(item1).toHaveAttribute('data-selected');
      fireEvent.click(item2);
      expect(item2).toHaveAttribute('data-selected');
    });

    it('should allow deselection of individual items', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupType="multiple">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(item1).toHaveAttribute('data-selected');
      fireEvent.click(item1); // Deselect
      expect(item1).not.toHaveAttribute('data-selected');
    });

    it('should emit valueChange on selection', async () => {
      const onValueChange = jest.fn();
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupType="multiple" (ngpToggleGroupValueChange)="onValueChange($event)">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
          componentProperties: {
            onValueChange,
          },
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(onValueChange).toHaveBeenCalledWith(['option-1']);
      fireEvent.click(item1); // Deselect
      expect(onValueChange).toHaveBeenCalledWith([]);
    });

    it('should not allow selection when disabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupType="multiple" ngpToggleGroupDisabled="true">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      fireEvent.click(item1);
      expect(item1).not.toHaveAttribute('data-selected');
    });
  });
});
