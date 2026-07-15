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
  selector: 'app-tree',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [
    provideIcons({ heroChevronRightMini, heroFolderMini, heroFolderOpenMini, heroDocumentMini }),
  ],
  template: `
    <ul
      class="m-0 w-full max-w-80 list-none rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
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
          class="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg pr-2 pl-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] text-sm tracking-[-0.006em] text-gray-900 transition-colors duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] outline-none select-none data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-hover:bg-gray-100 dark:text-zinc-100 dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-900"
          #n="ngpTreeNode"
          [ngpTreeNode]="node"
          ngpTreeNode
        >
          @if (n.expandable()) {
            <button
              class="group inline-flex h-[1.125rem] w-[1.125rem] flex-none cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-gray-400 dark:text-zinc-500"
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

          <span class="overflow-hidden text-ellipsis whitespace-nowrap">{{ node.name }}</span>
        </li>
      }
    </ul>
  `,
})
export default class TreeExample {
  readonly nodes: FileNode[] = [
    {
      id: 'src',
      name: 'src',
      children: [
        {
          id: 'app',
          name: 'app',
          children: [
            { id: 'app.component.ts', name: 'app.component.ts' },
            { id: 'app.component.html', name: 'app.component.html' },
            { id: 'app.config.ts', name: 'app.config.ts' },
          ],
        },
        {
          id: 'assets',
          name: 'assets',
          children: [{ id: 'logo.svg', name: 'logo.svg' }],
        },
        { id: 'main.ts', name: 'main.ts' },
        { id: 'styles.css', name: 'styles.css' },
      ],
    },
    {
      id: 'public',
      name: 'public',
      children: [{ id: 'favicon.ico', name: 'favicon.ico' }],
    },
    { id: 'package.json', name: 'package.json' },
    { id: 'README.md', name: 'README.md' },
  ];

  readonly expanded = new Set(['src', 'app']);

  readonly children = (node: FileNode) => node.children;
  readonly itemValue = (node: FileNode) => node.id;
  readonly itemLabel = (node: FileNode) => node.name;
}
