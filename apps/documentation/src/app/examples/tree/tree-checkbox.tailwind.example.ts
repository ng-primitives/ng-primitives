import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini, heroChevronRightMini, heroMinusMini } from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeCheckbox, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface Item {
  id: string;
  name: string;
  children?: Item[];
}

@Component({
  selector: 'app-tree-checkbox',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgpTreeNodeCheckbox, NgIcon],
  providers: [provideIcons({ heroChevronRightMini, heroCheckMini, heroMinusMini })],
  template: `
    <ul
      class="m-0 mx-auto w-full max-w-80 list-none rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
      #tree="ngpTree"
      [(ngpTreeCheckedKeys)]="checked"
      [ngpTreeNodes]="nodes"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeDefaultExpandedKeys]="expanded"
      ngpTree
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li
          class="flex h-8 items-center gap-2 rounded-lg pr-2 pl-[calc((var(--ngp-tree-node-level)-1)*1.25rem+0.375rem)] text-sm tracking-[-0.006em] text-gray-900 outline-none select-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100 dark:focus-visible:ring-blue-400"
          #n="ngpTreeNode"
          [ngpTreeNode]="node"
          ngpTreeNode
        >
          @if (n.expandable()) {
            <button
              class="group inline-flex h-[1.125rem] w-[1.125rem] flex-none items-center justify-center rounded border-none bg-transparent p-0 text-gray-400 dark:text-zinc-500"
              [attr.data-expanded]="n.expanded() ? '' : null"
              ngpTreeNodeToggle
            >
              <ng-icon
                class="text-base transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] group-data-expanded:rotate-90"
                name="heroChevronRightMini"
              />
            </button>
          } @else {
            <span class="h-[1.125rem] w-[1.125rem] flex-none"></span>
          }
          <button
            class="inline-flex h-[1.125rem] w-[1.125rem] flex-none items-center justify-center rounded-[0.3125rem] border-[1.5px] border-gray-300 bg-white p-0 text-transparent transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] data-checked:border-[#f01e2b] data-checked:bg-[#f01e2b] data-checked:text-white data-indeterminate:border-[#f01e2b] data-indeterminate:bg-[#f01e2b] data-indeterminate:text-white dark:border-zinc-700 dark:bg-zinc-950 dark:data-checked:border-[#ff4651] dark:data-checked:bg-[#ff4651] dark:data-indeterminate:border-[#ff4651] dark:data-indeterminate:bg-[#ff4651]"
            ngpTreeNodeCheckbox
          >
            @if (n.indeterminate()) {
              <ng-icon class="text-sm" name="heroMinusMini" />
            } @else if (n.checked()) {
              <ng-icon class="text-sm" name="heroCheckMini" />
            }
          </button>
          <span>{{ node.name }}</span>
        </li>
      }
    </ul>
  `,
})
export default class TreeCheckboxExample {
  readonly nodes: Item[] = [
    {
      id: 'src',
      name: 'src',
      children: [
        { id: 'app.ts', name: 'app.ts' },
        { id: 'main.ts', name: 'main.ts' },
        {
          id: 'utils',
          name: 'utils',
          children: [
            { id: 'dates.ts', name: 'dates.ts' },
            { id: 'strings.ts', name: 'strings.ts' },
          ],
        },
      ],
    },
    { id: 'readme', name: 'README.md' },
  ];

  readonly expanded = new Set(['src', 'utils']);
  readonly checked = signal<ReadonlySet<string>>(new Set(['app.ts']));

  readonly children = (node: Item) => node.children;
  readonly itemValue = (node: Item) => node.id;
  readonly itemLabel = (node: Item) => node.name;
}
