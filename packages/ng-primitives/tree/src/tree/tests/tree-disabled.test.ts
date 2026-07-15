import { fireEvent, render } from '@testing-library/angular';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';
import { describe, expect, it } from 'vitest';

interface Node {
  id: string;
  name: string;
  locked?: boolean;
  children?: Node[];
}

const nodes: Node[] = [
  { id: 'a', name: 'A', locked: true, children: [{ id: 'a1', name: 'A1' }] },
  { id: 'b', name: 'B', children: [{ id: 'b1', name: 'B1' }] },
];

const template = `
  <ul ngpTree #t="ngpTree" [ngpTreeNodes]="nodes" [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue" [ngpTreeItemDisabled]="itemDisabled"
      [ngpTreeDisabledBehavior]="behavior" [ngpTreeSelectionMode]="mode">
    @for (node of t.visibleNodes(); track itemValue(node)) {
      <li ngpTreeNode #n="ngpTreeNode" class="node" [ngpTreeNode]="node" [attr.data-value]="n.value()">
        <button ngpTreeNodeToggle class="toggle">t</button>
        <span>{{ node.name }}</span>
      </li>
    }
  </ul>
`;

async function renderTree(props: Record<string, unknown> = {}) {
  const view = await render(template, {
    imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle],
    componentProperties: {
      nodes,
      children: (n: Node) => n.children,
      itemValue: (n: Node) => n.id,
      itemDisabled: (n: Node) => n.locked === true,
      behavior: 'all',
      mode: 'none',
      ...props,
    },
  });
  const nodeEl = (value: string) =>
    view.container.querySelector<HTMLElement>(`.node[data-value="${value}"]`);
  const toggle = (value: string) => nodeEl(value)!.querySelector<HTMLElement>(':scope > .toggle')!;
  return { ...view, nodeEl, toggle };
}

describe('NgpTree disabled', () => {
  it('marks disabled nodes with aria-disabled and data-disabled', async () => {
    const { nodeEl } = await renderTree();
    expect(nodeEl('a')).toHaveAttribute('aria-disabled', 'true');
    expect(nodeEl('a')).toHaveAttribute('data-disabled');
    expect(nodeEl('b')!.hasAttribute('aria-disabled')).toBe(false);
  });

  it('does not expand a disabled node when its toggle is clicked', async () => {
    const { nodeEl, toggle } = await renderTree();

    fireEvent.click(toggle('a'));
    expect(nodeEl('a')).toHaveAttribute('aria-expanded', 'false');
    expect(nodeEl('a1')).toBeNull();
  });

  it('still expands an enabled node', async () => {
    const { nodeEl, toggle } = await renderTree();

    fireEvent.click(toggle('b'));
    expect(nodeEl('b')).toHaveAttribute('aria-expanded', 'true');
    expect(nodeEl('b1')).not.toBeNull();
  });

  it('disables the toggle button of a disabled node', async () => {
    const { toggle } = await renderTree();
    expect(toggle('a')).toBeDisabled();
    expect(toggle('b')).not.toBeDisabled();
  });
});

describe('NgpTree disabledBehavior="selection"', () => {
  it('lets a disabled node expand (toggle is not inert)', async () => {
    const { nodeEl, toggle } = await renderTree({ behavior: 'selection' });

    expect(toggle('a')).not.toBeDisabled();
    fireEvent.click(toggle('a'));
    expect(nodeEl('a')).toHaveAttribute('aria-expanded', 'true');
    expect(nodeEl('a1')).not.toBeNull();
  });

  it('still keeps a disabled node out of the selection', async () => {
    const { nodeEl } = await renderTree({ behavior: 'selection', mode: 'multiple' });

    // A non-selectable node omits aria-selected and never enters the selection.
    fireEvent.click(nodeEl('a')!);
    expect(nodeEl('a')).not.toHaveAttribute('data-selected');
    expect(nodeEl('a')).not.toHaveAttribute('aria-selected');
  });
});
