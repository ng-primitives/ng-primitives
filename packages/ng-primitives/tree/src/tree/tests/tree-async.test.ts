import { fireEvent, render, waitFor } from '@testing-library/angular';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';
import { describe, expect, it, vi } from 'vitest';

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const nodes: Node[] = [{ id: 'a', name: 'A' }];

const template = `
  <ul ngpTree #t="ngpTree" [ngpTreeNodes]="nodes" [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue" [ngpTreeItemExpandable]="isExpandable"
      [ngpTreeItemLoadChildren]="loadChildren">
    @for (node of t.visibleNodes(); track itemValue(node)) {
      <li ngpTreeNode #n="ngpTreeNode" class="node" [ngpTreeNode]="node"
          [attr.data-value]="n.value()" [attr.data-loading]="n.loading() ? '' : null">
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
      isExpandable: (n: Node) => n.id === 'a' || !!n.children?.length,
      loadChildren: () =>
        Promise.resolve([
          { id: 'a1', name: 'A1' },
          { id: 'a2', name: 'A2' },
        ]),
      ...props,
    },
  });
  const nodeEl = (value: string) =>
    view.container.querySelector<HTMLElement>(`.node[data-value="${value}"]`);
  const toggle = (value: string) => nodeEl(value)!.querySelector<HTMLElement>(':scope > .toggle')!;
  return { ...view, nodeEl, toggle };
}

describe('NgpTree async children', () => {
  it('shows a chevron for a lazy node before its children exist', async () => {
    const { nodeEl } = await renderTree();
    expect(nodeEl('a')).toHaveAttribute('aria-expanded', 'false');
    expect(nodeEl('a')).toHaveAttribute('data-expandable');
  });

  it('loads children on expand and renders them', async () => {
    const { nodeEl, toggle } = await renderTree();

    fireEvent.click(toggle('a'));
    expect(nodeEl('a')).toHaveAttribute('aria-expanded', 'true');

    await waitFor(() => expect(nodeEl('a1')).not.toBeNull());
    expect(nodeEl('a2')).not.toBeNull();
    expect(nodeEl('a1')).toHaveAttribute('aria-level', '2');
  });

  it('flags the node as busy while loading, then clears it', async () => {
    let resolveLoad!: (nodes: Node[]) => void;
    const loadChildren = () => new Promise<Node[]>(resolve => (resolveLoad = resolve));

    const { nodeEl, toggle } = await renderTree({ loadChildren });

    fireEvent.click(toggle('a'));
    expect(nodeEl('a')).toHaveAttribute('data-loading');
    expect(nodeEl('a')).toHaveAttribute('aria-busy', 'true');

    resolveLoad([{ id: 'a1', name: 'A1' }]);
    await waitFor(() => expect(nodeEl('a1')).not.toBeNull());
    expect(nodeEl('a')).not.toHaveAttribute('data-loading');
  });

  it('only loads once', async () => {
    const loadChildren = vi.fn(() => Promise.resolve([{ id: 'a1', name: 'A1' }]));
    const { nodeEl, toggle } = await renderTree({ loadChildren });

    fireEvent.click(toggle('a')); // expand -> load
    await waitFor(() => expect(nodeEl('a1')).not.toBeNull());
    fireEvent.click(toggle('a')); // collapse
    fireEvent.click(toggle('a')); // expand again -> no reload
    await waitFor(() => expect(nodeEl('a1')).not.toBeNull());

    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it('clears the busy state and retries on the next expand when a load fails', async () => {
    // Swallow the console.error the tree logs on failure.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    let attempt = 0;
    const loadChildren = vi.fn(() => {
      attempt++;
      return attempt === 1
        ? Promise.reject(new Error('boom'))
        : Promise.resolve([{ id: 'a1', name: 'A1' }]);
    });

    const { nodeEl, toggle } = await renderTree({ loadChildren });

    fireEvent.click(toggle('a')); // expand -> load rejects
    await waitFor(() => expect(nodeEl('a')).not.toHaveAttribute('data-loading'));
    expect(nodeEl('a1')).toBeNull();

    fireEvent.click(toggle('a')); // collapse
    fireEvent.click(toggle('a')); // expand again -> retry succeeds
    await waitFor(() => expect(nodeEl('a1')).not.toBeNull());
    expect(loadChildren).toHaveBeenCalledTimes(2);

    consoleError.mockRestore();
  });
});
