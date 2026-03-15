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

  describe('Focus Management', () => {
    it('should allow focus wrapping by default', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup>
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      const item3 = getByTestId('toggle-item-3');

      // Focus the first item
      item1.focus();
      expect(document.activeElement).toBe(item1);

      // Navigate to the second item with arrow right
      fireEvent.keyDown(item1, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item2);

      // Navigate to the third item with arrow right
      fireEvent.keyDown(item2, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item3);

      // Navigate past the last item should wrap to the first
      fireEvent.keyDown(item3, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item1);
    });

    it('should allow reverse focus wrapping by default', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup>
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      const item3 = getByTestId('toggle-item-3');

      // Focus the first item
      item1.focus();
      expect(document.activeElement).toBe(item1);

      // Navigate backwards past the first item should wrap to the last
      fireEvent.keyDown(item1, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(item3);

      // Navigate backwards to the second item
      fireEvent.keyDown(item3, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(item2);

      // Navigate backwards to the first item
      fireEvent.keyDown(item2, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(item1);
    });

    it('should not wrap focus when wrap is disabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupWrap="false">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      const item3 = getByTestId('toggle-item-3');

      // Focus the first item
      item1.focus();
      expect(document.activeElement).toBe(item1);

      // Navigate to the last item
      fireEvent.keyDown(item1, { key: 'ArrowRight', code: 'ArrowRight' });
      fireEvent.keyDown(item2, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item3);

      // Navigate past the last item should NOT wrap to the first
      fireEvent.keyDown(item3, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item3); // Should stay on the last item

      // Navigate backwards past the first item should NOT wrap to the last
      fireEvent.keyDown(item3, { key: 'ArrowLeft', code: 'ArrowLeft' });
      fireEvent.keyDown(item2, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(item1); // Should stay on the first item
    });

    it('should handle focus wrapping in vertical orientation', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupOrientation="vertical">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      const item3 = getByTestId('toggle-item-3');

      // Focus the first item
      item1.focus();
      expect(document.activeElement).toBe(item1);

      // Navigate to the last item using arrow down
      fireEvent.keyDown(item1, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(item2, { key: 'ArrowDown', code: 'ArrowDown' });
      expect(document.activeElement).toBe(item3);

      // Navigate past the last item should wrap to the first (vertical orientation uses ArrowDown/Up)
      fireEvent.keyDown(item3, { key: 'ArrowDown', code: 'ArrowDown' });
      expect(document.activeElement).toBe(item1);

      // Navigate backwards past the first item should wrap to the last
      fireEvent.keyDown(item1, { key: 'ArrowUp', code: 'ArrowUp' });
      expect(document.activeElement).toBe(item3);
    });

    it('should not wrap focus in vertical orientation when wrap is disabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupOrientation="vertical" ngpToggleGroupWrap="false">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      const item3 = getByTestId('toggle-item-3');

      // Focus the first item
      item1.focus();
      expect(document.activeElement).toBe(item1);

      // Navigate to the last item using arrow down
      fireEvent.keyDown(item1, { key: 'ArrowDown', code: 'ArrowDown' });
      fireEvent.keyDown(item2, { key: 'ArrowDown', code: 'ArrowDown' });
      expect(document.activeElement).toBe(item3);

      // Navigate past the last item should NOT wrap
      fireEvent.keyDown(item3, { key: 'ArrowDown', code: 'ArrowDown' });
      expect(document.activeElement).toBe(item3);

      // Navigate backwards past the first item should NOT wrap
      fireEvent.keyDown(item3, { key: 'ArrowUp', code: 'ArrowUp' });
      fireEvent.keyDown(item2, { key: 'ArrowUp', code: 'ArrowUp' });
      expect(document.activeElement).toBe(item1);

      fireEvent.keyDown(item1, { key: 'ArrowUp', code: 'ArrowUp' });
      expect(document.activeElement).toBe(item1);
    });

    it('should respect wrap setting in multiple type toggle group', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupType="multiple" ngpToggleGroupWrap="false">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');
      const item2 = getByTestId('toggle-item-2');
      const item3 = getByTestId('toggle-item-3');

      // Focus the first item
      item1.focus();
      expect(document.activeElement).toBe(item1);

      // Navigate to the last item
      fireEvent.keyDown(item1, { key: 'ArrowRight', code: 'ArrowRight' });
      fireEvent.keyDown(item2, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item3);

      // Navigate past the last item should NOT wrap in multiple type
      fireEvent.keyDown(item3, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item3);
    });

    it('should disable keyboard navigation when toggle group is disabled', async () => {
      const { getByTestId } = await render(
        `
        <div ngpToggleGroup ngpToggleGroupDisabled="true">
          <div data-testid="toggle-item-1" ngpToggleGroupItem ngpToggleGroupItemValue="option-1" tabindex="0"></div>
          <div data-testid="toggle-item-2" ngpToggleGroupItem ngpToggleGroupItemValue="option-2" tabindex="-1"></div>
          <div data-testid="toggle-item-3" ngpToggleGroupItem ngpToggleGroupItemValue="option-3" tabindex="-1"></div>
        </div>
        `,
        {
          imports: [NgpToggleGroup, NgpToggleGroupItem],
        },
      );

      const item1 = getByTestId('toggle-item-1');

      // Focus the first item
      item1.focus();
      expect(document.activeElement).toBe(item1);

      // When disabled, keyboard navigation should not work
      fireEvent.keyDown(item1, { key: 'ArrowRight', code: 'ArrowRight' });
      expect(document.activeElement).toBe(item1); // Should stay on the first item

      fireEvent.keyDown(item1, { key: 'ArrowLeft', code: 'ArrowLeft' });
      expect(document.activeElement).toBe(item1); // Should still stay on the first item
    });
  });
});
