import { fireEvent, render } from '@testing-library/angular';
import { NgpTree, NgpTreeNode, NgpTreeNodeCheckbox } from 'ng-primitives/tree';
import { describe, expect, it } from 'vitest';

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const nodes: Node[] = [
  {
    id: 'a',
    name: 'A',
    children: [
      { id: 'a1', name: 'A1' },
      { id: 'a2', name: 'A2' },
    ],
  },
  { id: 'b', name: 'B' },
];

async function renderTree(props: Record<string, unknown> = {}) {
  const template = `
    <ul ngpTree #t="ngpTree" [ngpTreeNodes]="nodes" [ngpTreeItemChildren]="children"
        [ngpTreeItemValue]="itemValue" [ngpTreeItemDisabled]="itemDisabled"
        [ngpTreeCheckboxBehavior]="checkboxBehavior"
        [ngpTreeDefaultExpandedKeys]="expanded"
        [ngpTreeCheckedKeys]="checked" (ngpTreeCheckedKeysChange)="checked = $event">
      @for (node of t.visibleNodes(); track itemValue(node)) {
        <li ngpTreeNode #n="ngpTreeNode" class="node" [ngpTreeNode]="node" [attr.data-value]="n.value()">
          <button ngpTreeNodeCheckbox class="cb" [attr.data-cb]="n.value()"></button>
          <span>{{ node.name }}</span>
        </li>
      }
    </ul>
  `;
  const view = await render(template, {
    imports: [NgpTree, NgpTreeNode, NgpTreeNodeCheckbox],
    componentProperties: {
      nodes,
      children: (n: Node) => n.children,
      itemValue: (n: Node) => n.id,
      itemDisabled: undefined,
      checkboxBehavior: 'cascade',
      expanded: new Set(['a']),
      checked: new Set<string>(),
      ...props,
    },
  });
  const cb = (value: string) =>
    view.container.querySelector<HTMLElement>(`.cb[data-cb="${value}"]`)!;
  const row = (value: string) =>
    view.container.querySelector<HTMLElement>(`.node[data-value="${value}"]`)!;
  return { ...view, cb, row };
}

describe('NgpTree checkbox', () => {
  it('exposes tri-state via aria-checked on the treeitem row', async () => {
    const { row } = await renderTree();
    expect(row('a')).toHaveAttribute('aria-checked', 'false');
    expect(row('a1')).toHaveAttribute('aria-checked', 'false');
  });

  it('renders the checkbox itself as decorative (hidden from AT, state via data attributes)', async () => {
    const { cb } = await renderTree({ checked: new Set(['a1']) });
    expect(cb('a1')).toHaveAttribute('aria-hidden', 'true');
    expect(cb('a1')).not.toHaveAttribute('role');
    expect(cb('a1')).not.toHaveAttribute('aria-checked');
    expect(cb('a1')).toHaveAttribute('data-checked');
    expect(cb('a2')).not.toHaveAttribute('data-checked');
  });

  it('checking a leaf makes the parent indeterminate, checking all makes it checked', async () => {
    const { cb, row } = await renderTree();

    fireEvent.click(cb('a1'));
    expect(row('a1')).toHaveAttribute('aria-checked', 'true');
    expect(row('a')).toHaveAttribute('aria-checked', 'mixed');
    expect(cb('a')).toHaveAttribute('data-indeterminate');

    fireEvent.click(cb('a2'));
    expect(row('a')).toHaveAttribute('aria-checked', 'true');
    expect(cb('a')).not.toHaveAttribute('data-indeterminate');
  });

  it('checking a parent checks all its descendants', async () => {
    const { cb, row } = await renderTree();

    fireEvent.click(cb('a'));
    expect(row('a')).toHaveAttribute('aria-checked', 'true');
    expect(row('a1')).toHaveAttribute('aria-checked', 'true');
    expect(row('a2')).toHaveAttribute('aria-checked', 'true');
  });

  it('unchecking a parent unchecks all its descendants', async () => {
    const { cb, row } = await renderTree({ checked: new Set(['a1', 'a2']) });
    expect(row('a')).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(cb('a'));
    expect(row('a')).toHaveAttribute('aria-checked', 'false');
    expect(row('a1')).toHaveAttribute('aria-checked', 'false');
  });

  it('reflects a controlled checkedKeys binding', async () => {
    const { row } = await renderTree({ checked: new Set(['a1']) });
    expect(row('a1')).toHaveAttribute('aria-checked', 'true');
    expect(row('a')).toHaveAttribute('aria-checked', 'mixed');
  });

  it('toggles the checkbox when Space is pressed on the row', async () => {
    const { row } = await renderTree();

    fireEvent.keyDown(row('a1'), { key: ' ' });
    expect(row('a1')).toHaveAttribute('aria-checked', 'true');

    fireEvent.keyDown(row('a1'), { key: ' ' });
    expect(row('a1')).toHaveAttribute('aria-checked', 'false');
  });

  it('checks a whole subtree when Space is pressed on a parent row', async () => {
    const { row } = await renderTree();

    fireEvent.keyDown(row('a'), { key: ' ' });
    expect(row('a')).toHaveAttribute('aria-checked', 'true');
    expect(row('a1')).toHaveAttribute('aria-checked', 'true');
    expect(row('a2')).toHaveAttribute('aria-checked', 'true');
  });

  it('does not toggle a disabled node checkbox via Space', async () => {
    const { cb, row } = await renderTree({
      itemDisabled: (n: Node) => n.id === 'a1',
    });

    fireEvent.keyDown(row('a1'), { key: ' ' });
    expect(row('a1')).toHaveAttribute('aria-checked', 'false');
    // The decorative checkbox reflects the disabled state as data only.
    expect(cb('a1')).toHaveAttribute('data-disabled');
    expect(cb('a1')).not.toHaveAttribute('aria-disabled');
  });

  describe('independent behavior', () => {
    it('checking a parent does not cascade to descendants', async () => {
      const { cb, row } = await renderTree({ checkboxBehavior: 'independent' });

      fireEvent.click(cb('a'));
      expect(row('a')).toHaveAttribute('aria-checked', 'true');
      expect(row('a1')).toHaveAttribute('aria-checked', 'false');
      expect(row('a2')).toHaveAttribute('aria-checked', 'false');
    });

    it('a parent never becomes indeterminate from its children', async () => {
      const { cb, row } = await renderTree({
        checkboxBehavior: 'independent',
        checked: new Set(['a1']),
      });

      expect(row('a1')).toHaveAttribute('aria-checked', 'true');
      expect(row('a')).toHaveAttribute('aria-checked', 'false');
      expect(cb('a')).not.toHaveAttribute('data-indeterminate');
    });

    it('toggles a single node on and off', async () => {
      const { cb, row } = await renderTree({ checkboxBehavior: 'independent' });

      fireEvent.click(cb('a'));
      expect(row('a')).toHaveAttribute('aria-checked', 'true');
      fireEvent.click(cb('a'));
      expect(row('a')).toHaveAttribute('aria-checked', 'false');
    });
  });
});
