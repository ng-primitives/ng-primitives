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
        [ngpTreeItemValue]="itemValue" [ngpTreeDefaultExpandedKeys]="expanded"
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
      expanded: new Set(['a']),
      checked: new Set<string>(),
      ...props,
    },
  });
  const cb = (value: string) =>
    view.container.querySelector<HTMLElement>(`.cb[data-cb="${value}"]`)!;
  return { ...view, cb };
}

describe('NgpTree checkbox', () => {
  it('exposes tri-state via aria-checked', async () => {
    const { cb } = await renderTree();
    expect(cb('a')).toHaveAttribute('aria-checked', 'false');
    expect(cb('a1')).toHaveAttribute('aria-checked', 'false');
  });

  it('checking a leaf makes the parent indeterminate, checking all makes it checked', async () => {
    const { cb } = await renderTree();

    fireEvent.click(cb('a1'));
    expect(cb('a1')).toHaveAttribute('aria-checked', 'true');
    expect(cb('a')).toHaveAttribute('aria-checked', 'mixed');
    expect(cb('a')).toHaveAttribute('data-indeterminate');

    fireEvent.click(cb('a2'));
    expect(cb('a')).toHaveAttribute('aria-checked', 'true');
    expect(cb('a')).not.toHaveAttribute('data-indeterminate');
  });

  it('checking a parent checks all its descendants', async () => {
    const { cb } = await renderTree();

    fireEvent.click(cb('a'));
    expect(cb('a')).toHaveAttribute('aria-checked', 'true');
    expect(cb('a1')).toHaveAttribute('aria-checked', 'true');
    expect(cb('a2')).toHaveAttribute('aria-checked', 'true');
  });

  it('unchecking a parent unchecks all its descendants', async () => {
    const { cb } = await renderTree({ checked: new Set(['a1', 'a2']) });
    expect(cb('a')).toHaveAttribute('aria-checked', 'true');

    fireEvent.click(cb('a'));
    expect(cb('a')).toHaveAttribute('aria-checked', 'false');
    expect(cb('a1')).toHaveAttribute('aria-checked', 'false');
  });

  it('reflects a controlled checkedKeys binding', async () => {
    const { cb } = await renderTree({ checked: new Set(['a1']) });
    expect(cb('a1')).toHaveAttribute('aria-checked', 'true');
    expect(cb('a')).toHaveAttribute('aria-checked', 'mixed');
  });
});
