import { fireEvent, render } from '@testing-library/angular';
import { NgpToggleGroupItem } from '../../toggle-group-item/toggle-group-item';
import { ToggleGroup, ToggleGroupItemFixture } from './toggle-group-forms.fixture';

describe('ToggleGroup (reusable component) — standalone', () => {
  it('renders with initial unselected state', async () => {
    const { getByTestId } = await render(
      `
      <app-toggle-group>
        <button app-toggle-group-item data-testid="item-1" value="option-1">1</button>
        <button app-toggle-group-item data-testid="item-2" value="option-2">2</button>
      </app-toggle-group>
      `,
      {
        imports: [ToggleGroup, ToggleGroupItemFixture, NgpToggleGroupItem],
      },
    );

    expect(getByTestId('item-1')).not.toHaveAttribute('data-selected');
    expect(getByTestId('item-2')).not.toHaveAttribute('data-selected');
  });

  it('toggles selection on click', async () => {
    const { getByTestId } = await render(
      `
      <app-toggle-group>
        <button app-toggle-group-item data-testid="item-1" value="option-1">1</button>
        <button app-toggle-group-item data-testid="item-2" value="option-2">2</button>
      </app-toggle-group>
      `,
      {
        imports: [ToggleGroup, ToggleGroupItemFixture, NgpToggleGroupItem],
      },
    );

    const item1 = getByTestId('item-1');
    fireEvent.click(item1);
    expect(item1).toHaveAttribute('data-selected');
    fireEvent.click(item1);
    expect(item1).not.toHaveAttribute('data-selected');
  });

  it('does not toggle when disabled', async () => {
    const { getByTestId } = await render(
      `
      <app-toggle-group disabled="true">
        <button app-toggle-group-item data-testid="item-1" value="option-1">1</button>
        <button app-toggle-group-item data-testid="item-2" value="option-2">2</button>
      </app-toggle-group>
      `,
      {
        imports: [ToggleGroup, ToggleGroupItemFixture, NgpToggleGroupItem],
      },
    );

    const item1 = getByTestId('item-1');
    fireEvent.click(item1);
    expect(item1).not.toHaveAttribute('data-selected');
  });
});
