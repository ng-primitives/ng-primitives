import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronRightMini,
  heroDocumentMini,
  heroFolderMini,
  heroFolderOpenMini,
} from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface FileNode {
  id: string;
  name: string;
  children?: FileNode[];
}

@Component({
  selector: 'app-tree-indent-guides',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [
    provideIcons({ heroChevronRightMini, heroFolderMini, heroFolderOpenMini, heroDocumentMini }),
  ],
  host: {
    class: 'flex w-full justify-center',
  },
  template: `
    <ul
      class="m-0 w-full max-w-80 list-none rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none [--guide:#e5e7eb] [--indent:1.25rem] [--toggle-half:0.5625rem] dark:border-zinc-800 dark:bg-zinc-950 dark:[--guide:#27272a]"
      #tree="ngpTree"
      [ngpTreeNodes]="nodes"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeDefaultExpandedKeys]="expanded"
      ngpTree
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li
          class="relative flex h-8 cursor-pointer items-center gap-1.5 rounded-lg pr-2 pl-[calc(var(--ngp-tree-node-level)_*_var(--indent))] text-sm tracking-[-0.006em] text-gray-900 outline-none select-none before:pointer-events-none before:absolute before:inset-y-0 before:left-[var(--indent)] before:w-[calc((var(--ngp-tree-node-level)_-_1)_*_var(--indent))] before:bg-[repeating-linear-gradient(to_right,transparent_0,transparent_var(--toggle-half),var(--guide)_var(--toggle-half),var(--guide)_calc(var(--toggle-half)_+_1px),transparent_calc(var(--toggle-half)_+_1px),transparent_var(--indent))] before:content-[''] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:ring-blue-400"
          #n="ngpTreeNode"
          [ngpTreeNode]="node"
          ngpTreeNode
        >
          @if (n.expandable()) {
            <button
              class="group/toggle inline-flex h-[1.125rem] w-[1.125rem] flex-none cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-gray-400 dark:text-zinc-500"
              ngpTreeNodeToggle
            >
              <ng-icon
                class="text-base transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] group-data-expanded/toggle:rotate-90"
                name="heroChevronRightMini"
              />
            </button>
          } @else {
            <span class="h-[1.125rem] w-[1.125rem] flex-none"></span>
          }
          <ng-icon
            class="flex-none text-[1.125rem] text-gray-400 dark:text-zinc-500"
            [name]="
              n.expandable()
                ? n.expanded()
                  ? 'heroFolderOpenMini'
                  : 'heroFolderMini'
                : 'heroDocumentMini'
            "
          />
          <span>{{ node.name }}</span>
        </li>
      }
    </ul>
  `,
})
export default class TreeIndentGuidesExample {
  readonly nodes: FileNode[] = [
    {
      id: 'src',
      name: 'src',
      children: [
        {
          id: 'app',
          name: 'app',
          children: [
            {
              id: 'components',
              name: 'components',
              children: [{ id: 'button.ts', name: 'button.ts' }],
            },
            { id: 'app.ts', name: 'app.ts' },
          ],
        },
        { id: 'main.ts', name: 'main.ts' },
      ],
    },
    { id: 'package.json', name: 'package.json' },
  ];

  readonly expanded = new Set(['src', 'app', 'components']);

  readonly children = (node: FileNode) => node.children;
  readonly itemValue = (node: FileNode) => node.id;
  readonly itemLabel = (node: FileNode) => node.name;
}
