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
      { id: 'a2', name: 'A2' },
    ],
  },
  { id: 'b', name: 'B' },
];

async function renderTree(props: Record<string, unknown> = {}) {
  const template = `
    <ul ngpTree #t="ngpTree" data-testid="tree"
        [ngpTreeNodes]="nodes" [ngpTreeChildren]="children" [ngpTreeItemValue]="itemValue"
        [ngpTreeSelectionMode]="mode"
        [ngpTreeSelectionBehavior]="behavior"
        [ngpTreeDefaultExpandedKeys]="expanded"
        [ngpTreeSelectedKeys]="selected"
        (ngpTreeSelectedKeysChange)="selected = $event">
      @for (node of t.visibleNodes(); track itemValue(node)) {
        <li ngpTreeNode #n="ngpTreeNode" class="node" [ngpTreeNode]="node" [attr.data-value]="n.value()">
          <button ngpTreeNodeToggle class="toggle">t</button>
          <span>{{ node.name }}</span>
        </li>
      }
    </ul>
  `;
  const view = await render(template, {
    imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle],
    componentProperties: {
      nodes,
      children: (n: Node) => n.children,
      itemValue: (n: Node) => n.id,
      mode: 'none',
      behavior: 'toggle',
      expanded: new Set(['a']),
      selected: new Set<string>(),
      ...props,
    },
  });
  const tree = view.getByTestId('tree');
  const nodeEl = (value: string) =>
    view.container.querySelector<HTMLElement>(`.node[data-value="${value}"]`)!;
  const click = (value: string, init?: MouseEventInit) => fireEvent.click(nodeEl(value), init);
  const press = (value: string, key: string, init?: KeyboardEventInit) => {
    nodeEl(value).focus();
    fireEvent.keyDown(nodeEl(value), { key, ...init });
  };
  return { ...view, tree, nodeEl, click, press };
}

describe('NgpTree selection', () => {
  it('mode "none": no aria-selected and clicks do not select', async () => {
    const { tree, nodeEl, click } = await renderTree({ mode: 'none' });
    expect(nodeEl('a').hasAttribute('aria-selected')).toBe(false);
    expect(tree.hasAttribute('aria-multiselectable')).toBe(false);
    click('a');
    expect(nodeEl('a').hasAttribute('aria-selected')).toBe(false);
  });

  it('single: clicking selects and replaces the previous selection', async () => {
    const { nodeEl, click } = await renderTree({ mode: 'single' });
    expect(nodeEl('a')).toHaveAttribute('aria-selected', 'false');

    click('a');
    expect(nodeEl('a')).toHaveAttribute('aria-selected', 'true');
    expect(nodeEl('a')).toHaveAttribute('data-selected');

    click('b');
    expect(nodeEl('b')).toHaveAttribute('aria-selected', 'true');
    expect(nodeEl('a')).toHaveAttribute('aria-selected', 'false');
  });

  it('multiple: sets aria-multiselectable and toggles each node independently', async () => {
    const { tree, nodeEl, click } = await renderTree({ mode: 'multiple' });
    expect(tree).toHaveAttribute('aria-multiselectable', 'true');

    click('a');
    click('a1');
    expect(nodeEl('a')).toHaveAttribute('aria-selected', 'true');
    expect(nodeEl('a1')).toHaveAttribute('aria-selected', 'true');

    click('a'); // toggle off
    expect(nodeEl('a')).toHaveAttribute('aria-selected', 'false');
    expect(nodeEl('a1')).toHaveAttribute('aria-selected', 'true');
  });

  it('Space toggles selection of the focused node', async () => {
    const { nodeEl, press } = await renderTree({ mode: 'multiple' });
    press('a', ' ');
    expect(nodeEl('a')).toHaveAttribute('aria-selected', 'true');
    press('a', ' ');
    expect(nodeEl('a')).toHaveAttribute('aria-selected', 'false');
  });

  it('multiple/replace: plain click replaces, modifier-click toggles', async () => {
    const { nodeEl, click } = await renderTree({ mode: 'multiple', behavior: 'replace' });

    click('a'); // replace -> only a
    expect(nodeEl('a')).toHaveAttribute('aria-selected', 'true');
    expect(nodeEl('b')).toHaveAttribute('aria-selected', 'false');

    click('b', { ctrlKey: true, metaKey: true }); // modifier -> add b
    expect(nodeEl('a')).toHaveAttribute('aria-selected', 'true');
    expect(nodeEl('b')).toHaveAttribute('aria-selected', 'true');

    click('a', { ctrlKey: true, metaKey: true }); // modifier -> remove a
    expect(nodeEl('a')).toHaveAttribute('aria-selected', 'false');
    expect(nodeEl('b')).toHaveAttribute('aria-selected', 'true');
  });

  it('Ctrl/Cmd+A selects all nodes in multiple mode', async () => {
    const { nodeEl, press } = await renderTree({ mode: 'multiple' });
    // Send both modifiers so the test is platform-independent.
    press('a', 'a', { ctrlKey: true, metaKey: true });
    for (const v of ['a', 'a1', 'a2', 'b']) {
      expect(nodeEl(v)).toHaveAttribute('aria-selected', 'true');
    }
  });

  it('reflects a controlled selectedKeys binding', async () => {
    const { nodeEl } = await renderTree({ mode: 'single', selected: new Set(['b']) });
    expect(nodeEl('b')).toHaveAttribute('aria-selected', 'true');
    expect(nodeEl('a')).toHaveAttribute('aria-selected', 'false');
  });

  it('selection follows focus in single mode with replace behavior', async () => {
    const { nodeEl, press } = await renderTree({ mode: 'single', behavior: 'replace' });
    press('a', 'ArrowDown'); // focus moves a -> a1, selection follows
    expect(nodeEl('a1')).toHaveAttribute('aria-selected', 'true');
  });
});
