import { render } from '@testing-library/angular';
import { NgpTree, NgpTreeNode } from 'ng-primitives/tree';
import { describe, expect, it } from 'vitest';

interface Node {
  id: string;
  name: string;
  children?: Node[];
}

const nodes: Node[] = [
  {
    id: 'src',
    name: 'src',
    children: [
      { id: 'app.ts', name: 'app.ts' },
      { id: 'button.ts', name: 'button.ts' },
    ],
  },
  {
    id: 'assets',
    name: 'assets',
    children: [{ id: 'logo.svg', name: 'logo.svg' }],
  },
  { id: 'readme', name: 'README.md' },
];

async function renderTree(props: Record<string, unknown> = {}) {
  const view = await render(
    `
    <ul ngpTree #t="ngpTree" [ngpTreeNodes]="nodes" [ngpTreeItemChildren]="children"
        [ngpTreeItemValue]="itemValue" [ngpTreeItemLabel]="itemLabel"
        [ngpTreeQuery]="search" [ngpTreeItemMatch]="itemMatch">
      @for (node of t.visibleNodes(); track itemValue(node)) {
        <li ngpTreeNode #n="ngpTreeNode" class="node" [ngpTreeNode]="node"
            [attr.data-value]="n.value()" [attr.data-match]="n.matched() ? '' : null"
            [attr.data-expanded]="n.expanded() ? '' : null">
          {{ node.name }}
        </li>
      }
    </ul>
  `,
    {
      imports: [NgpTree, NgpTreeNode],
      componentProperties: {
        nodes,
        children: (n: Node) => n.children,
        itemValue: (n: Node) => n.id,
        itemLabel: (n: Node) => n.name,
        search: '',
        itemMatch: undefined,
        ...props,
      },
    },
  );
  const rows = () =>
    [...view.container.querySelectorAll<HTMLElement>('.node')].map(el => el.dataset.value!);
  const row = (v: string) => view.container.querySelector<HTMLElement>(`.node[data-value="${v}"]`);
  return { ...view, rows, row };
}

describe('NgpTree search', () => {
  it('shows the full tree (roots + expanded) when the query is empty', async () => {
    const { rows } = await renderTree({ search: '' });
    // Nothing expanded by default, so only roots show.
    expect(rows()).toEqual(['src', 'assets', 'readme']);
  });

  it('filters to matches and reveals their ancestors', async () => {
    const { rows, row } = await renderTree({ search: 'button' });
    // 'button.ts' matches; 'src' is its ancestor and is revealed + expanded.
    expect(rows()).toEqual(['src', 'button.ts']);
    expect(row('button.ts')).toHaveAttribute('data-match');
    expect(row('src')).not.toHaveAttribute('data-match'); // ancestor, not a match
    expect(row('src')).toHaveAttribute('data-expanded'); // revealed as open
    // Unrelated branches are hidden.
    expect(row('assets')).toBeNull();
    expect(row('app.ts')).toBeNull();
    expect(row('readme')).toBeNull();
  });

  it('matches a folder by name and shows it (without unmatched children)', async () => {
    const { rows, row } = await renderTree({ search: 'assets' });
    expect(rows()).toEqual(['assets']);
    expect(row('assets')).toHaveAttribute('data-match');
    expect(row('logo.svg')).toBeNull(); // child doesn't match
  });

  it('is case-insensitive by default', async () => {
    const { rows } = await renderTree({ search: 'README' });
    expect(rows()).toEqual(['readme']);
  });

  it('supports a custom match predicate', async () => {
    const { rows } = await renderTree({
      search: 'x',
      // match only exact id 'app.ts' regardless of query text
      itemMatch: (n: Node) => n.id === 'app.ts',
    });
    expect(rows()).toEqual(['src', 'app.ts']);
  });

  it('restores the normal tree when the query is cleared', async () => {
    const { rows, fixture, detectChanges } = await renderTree({ search: 'button' });
    expect(rows()).toEqual(['src', 'button.ts']);
    fixture.componentInstance.search = '';
    detectChanges();
    expect(rows()).toEqual(['src', 'assets', 'readme']);
  });
});
