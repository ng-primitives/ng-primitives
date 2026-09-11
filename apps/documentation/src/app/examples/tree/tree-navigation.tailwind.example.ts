import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronRightMini } from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface Category {
  id: string;
  label: string;
  count?: number;
  children?: Category[];
}

@Component({
  selector: 'app-tree-navigation',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [provideIcons({ heroChevronRightMini })],
  template: `
    <ul
      class="m-0 w-full max-w-72 list-none rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
      #tree="ngpTree"
      [ngpTreeNodes]="nodes"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeDefaultExpandedKeys]="expanded"
      (ngpTreeActivate)="active.set(itemValue($event))"
      ngpTree
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li
          class="flex h-8 cursor-pointer items-center gap-2 rounded-lg pr-2.5 pl-[calc((var(--ngp-tree-node-level)-1)*1rem+0.5rem)] text-sm font-[510] tracking-[-0.006em] text-gray-900 outline-none select-none data-active:text-[#f01e2b] data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-hover:bg-gray-100 dark:text-zinc-100 dark:data-active:text-[#ff4651] dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-900"
          #n="ngpTreeNode"
          [ngpTreeNode]="node"
          [attr.data-active]="active() === node.id ? '' : null"
          ngpTreeNode
        >
          @if (n.expandable()) {
            <button
              class="group inline-flex h-4 w-4 flex-none cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-gray-400 dark:text-zinc-500"
              ngpTreeNodeToggle
            >
              <ng-icon
                class="text-[0.9375rem] transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] group-data-expanded:rotate-90"
                name="heroChevronRightMini"
              />
            </button>
          } @else {
            <span class="h-4 w-4 flex-none"></span>
          }
          <span>{{ node.label }}</span>
          @if (node.count !== undefined) {
            <span
              class="ml-auto inline-flex h-[1.125rem] min-w-5 items-center justify-center rounded-full bg-gray-100 px-1.5 text-xs font-[590] text-gray-600 dark:bg-zinc-900 dark:text-zinc-400"
            >
              {{ node.count }}
            </span>
          }
        </li>
      }
    </ul>
  `,
})
export default class TreeNavigationExample {
  readonly nodes: Category[] = [
    {
      id: 'clothing',
      label: 'Clothing',
      children: [
        {
          id: 'mens',
          label: "Men's",
          children: [
            { id: 'shirts', label: 'Shirts', count: 42 },
            { id: 'trousers', label: 'Trousers', count: 28 },
          ],
        },
        {
          id: 'womens',
          label: "Women's",
          children: [
            { id: 'dresses', label: 'Dresses', count: 63 },
            { id: 'knitwear', label: 'Knitwear', count: 31 },
          ],
        },
      ],
    },
    {
      id: 'electronics',
      label: 'Electronics',
      children: [
        { id: 'phones', label: 'Phones', count: 17 },
        { id: 'laptops', label: 'Laptops', count: 24 },
      ],
    },
    { id: 'gift-cards', label: 'Gift Cards', count: 5 },
  ];

  readonly expanded = new Set(['clothing', 'mens']);

  /** The activated ("current") item - double-click or press Enter to change it. */
  readonly active = signal('shirts');

  readonly children = (node: Category) => node.children;
  readonly itemValue = (node: Category) => node.id;
  readonly itemLabel = (node: Category) => node.label;
}
