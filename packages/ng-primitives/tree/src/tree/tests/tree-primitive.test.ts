import { fireEvent, render } from '@testing-library/angular';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';
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
      { id: 'a2', name: 'A2', children: [{ id: 'a2x', name: 'A2X' }] },
    ],
  },
  { id: 'b', name: 'B' },
];

/**
 * The tree renders a flat list of the currently-visible nodes (`t.visibleNodes()`)
 * with a single `@for`, so it drops straight into a virtual-scroll loop. Hierarchy
 * is conveyed with `aria-level` / `aria-setsize` / `aria-posinset` rather than DOM
 * nesting.
 */
const template = `
  <ul
    ngpTree
    #t="ngpTree"
    data-testid="tree"
    [ngpTreeNodes]="nodes"
    [ngpTreeItemChildren]="children"
    [ngpTreeItemValue]="itemValue">
    @for (node of t.visibleNodes(); track itemValue(node)) {
      <li ngpTreeNode #n="ngpTreeNode" class="node" [ngpTreeNode]="node" [attr.data-value]="n.value()">
        <button ngpTreeNodeToggle class="toggle">t</button>
        <span class="label">{{ node.name }}</span>
      </li>
    }
  </ul>
`;

const imports = [NgpTree, NgpTreeNode, NgpTreeNodeToggle];

async function renderTree() {
  const view = await render(template, {
    imports,
    componentProperties: {
      nodes,
      children: (n: Node) => n.children,
      itemValue: (n: Node) => n.id,
    },
  });
  const tree = view.getByTestId('tree');
  const nodeEls = () => Array.from(view.container.querySelectorAll<HTMLElement>('.node'));
  const nodeEl = (value: string) =>
    view.container.querySelector<HTMLElement>(`.node[data-value="${value}"]`);
  const toggle = (value: string) => nodeEl(value)!.querySelector<HTMLElement>(':scope > .toggle')!;
  const clickToggle = (value: string) => fireEvent.click(toggle(value));
  return { ...view, tree, nodeEls, nodeEl, toggle, clickToggle };
}

describe('NgpTree', () => {
  it('exposes tree/treeitem roles and aria-level', async () => {
    const { tree, nodeEl } = await renderTree();

    expect(tree).toHaveAttribute('role', 'tree');
    expect(nodeEl('a')).toHaveAttribute('role', 'treeitem');
    expect(nodeEl('a')).toHaveAttribute('aria-level', '1');
  });

  it('only renders visible (root) nodes while collapsed', async () => {
    const { nodeEls, nodeEl } = await renderTree();

    expect(nodeEls().map(el => el.dataset['value'])).toEqual(['a', 'b']);
    expect(nodeEl('a1')).toBeNull();
  });

  it('sets aria-setsize and aria-posinset per sibling group', async () => {
    const { nodeEl } = await renderTree();

    expect(nodeEl('a')).toHaveAttribute('aria-setsize', '2');
    expect(nodeEl('a')).toHaveAttribute('aria-posinset', '1');
    expect(nodeEl('b')).toHaveAttribute('aria-setsize', '2');
    expect(nodeEl('b')).toHaveAttribute('aria-posinset', '2');
  });

  it('marks expandable parents with aria-expanded and omits it on leaves', async () => {
    const { nodeEl } = await renderTree();

    expect(nodeEl('a')).toHaveAttribute('aria-expanded', 'false');
    expect(nodeEl('b')!.hasAttribute('aria-expanded')).toBe(false);
  });

  it('renders children (flat) when expanded, with deeper aria-level', async () => {
    const { nodeEls, nodeEl, clickToggle } = await renderTree();

    clickToggle('a');

    expect(nodeEl('a')).toHaveAttribute('aria-expanded', 'true');
    expect(nodeEls().map(el => el.dataset['value'])).toEqual(['a', 'a1', 'a2', 'b']);
    expect(nodeEl('a1')).toHaveAttribute('aria-level', '2');
    expect(nodeEl('a1')).toHaveAttribute('aria-setsize', '2');
    expect(nodeEl('a1')).toHaveAttribute('aria-posinset', '1');
  });

  it('recurses to arbitrary depth', async () => {
    const { nodeEl, clickToggle } = await renderTree();

    clickToggle('a');
    clickToggle('a2');

    expect(nodeEl('a2x')).not.toBeNull();
    expect(nodeEl('a2x')).toHaveAttribute('aria-level', '3');
  });

  it('collapses again, removing descendants', async () => {
    const { nodeEls, clickToggle } = await renderTree();

    clickToggle('a');
    expect(nodeEls()).toHaveLength(4);

    clickToggle('a');
    expect(nodeEls().map(el => el.dataset['value'])).toEqual(['a', 'b']);
  });
});
