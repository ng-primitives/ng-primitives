import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronRightMini,
  heroFolderMini,
  heroFolderOpenMini,
  heroHashtagMini,
} from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface Item {
  id: string;
  name: string;
  children?: Item[];
}

@Component({
  selector: 'app-tree-selection',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [
    provideIcons({ heroChevronRightMini, heroFolderMini, heroFolderOpenMini, heroHashtagMini }),
  ],
  template: `
    <ul
      class="m-0 w-full max-w-80 list-none rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
      #tree="ngpTree"
      [(ngpTreeSelectedKeys)]="selected"
      [ngpTreeNodes]="nodes"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeDefaultExpandedKeys]="expanded"
      ngpTree
      ngpTreeSelectionMode="multiple"
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li
          class="group flex h-8 cursor-pointer items-center gap-1.5 rounded-lg pr-2 pl-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] text-sm tracking-[-0.006em] text-gray-900 transition-colors duration-150 ease-in-out outline-none select-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 data-selected:bg-[#f01e2b]/[0.14] data-selected:hover:bg-[#f01e2b]/[0.2] dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:ring-blue-400 dark:data-selected:bg-[#ff4651]/[0.14] dark:data-selected:hover:bg-[#ff4651]/[0.2]"
          #n="ngpTreeNode"
          [ngpTreeNode]="node"
          ngpTreeNode
        >
          @if (n.expandable()) {
            <button
              class="group/toggle inline-flex h-[1.125rem] w-[1.125rem] flex-none cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-gray-400 dark:text-zinc-500"
              [attr.data-expanded]="n.expanded() ? '' : null"
              ngpTreeNodeToggle
            >
              <ng-icon
                class="text-base transition-transform duration-150 ease-in-out group-data-[expanded]/toggle:rotate-90"
                name="heroChevronRightMini"
              />
            </button>
          } @else {
            <span class="h-[1.125rem] w-[1.125rem] flex-none"></span>
          }
          <ng-icon
            class="flex-none text-[1.125rem] text-gray-400 group-data-[selected]:text-[#f01e2b] dark:text-zinc-500 dark:group-data-[selected]:text-[#ff4651]"
            [name]="
              n.expandable()
                ? n.expanded()
                  ? 'heroFolderOpenMini'
                  : 'heroFolderMini'
                : 'heroHashtagMini'
            "
          />
          <span>{{ node.name }}</span>
        </li>
      }
    </ul>

    <p class="text-[0.8125rem] text-gray-600 dark:text-zinc-400">{{ selected().size }} selected</p>
  `,
})
export default class TreeSelectionExample {
  readonly nodes: Item[] = [
    {
      id: 'frontend',
      name: 'Frontend',
      children: [
        { id: 'angular', name: 'Angular' },
        { id: 'react', name: 'React' },
        { id: 'vue', name: 'Vue' },
      ],
    },
    {
      id: 'backend',
      name: 'Backend',
      children: [
        { id: 'node', name: 'Node.js' },
        { id: 'go', name: 'Go' },
      ],
    },
    { id: 'devops', name: 'DevOps' },
  ];

  readonly expanded = new Set(['frontend', 'backend']);
  readonly selected = signal<ReadonlySet<string>>(new Set(['angular']));

  readonly children = (node: Item) => node.children;
  readonly itemValue = (node: Item) => node.id;
  readonly itemLabel = (node: Item) => node.name;
}
