import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronRightMini,
  heroDocumentMini,
  heroFolderMini,
  heroFolderOpenMini,
  heroLockClosedMini,
} from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface FileNode {
  id: string;
  name: string;
  locked?: boolean;
  children?: FileNode[];
}

@Component({
  selector: 'app-tree-disabled',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [
    provideIcons({
      heroChevronRightMini,
      heroFolderMini,
      heroFolderOpenMini,
      heroDocumentMini,
      heroLockClosedMini,
    }),
  ],
  template: `
    <ul
      class="m-0 w-full max-w-80 list-none rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
      #tree="ngpTree"
      [ngpTreeNodes]="nodes"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeItemDisabled]="itemDisabled"
      [ngpTreeDefaultExpandedKeys]="expanded"
      ngpTree
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li
          class="group flex h-8 cursor-pointer items-center gap-1.5 rounded-lg pr-2 pl-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] text-sm tracking-[-0.006em] text-gray-900 outline-none select-none data-disabled:cursor-not-allowed data-disabled:text-gray-400 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-hover:bg-gray-100 data-disabled:data-hover:bg-transparent dark:text-zinc-100 dark:data-disabled:text-zinc-600 dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-900"
          #n="ngpTreeNode"
          [ngpTreeNode]="node"
          ngpTreeNode
        >
          @if (n.expandable()) {
            <button
              class="group/toggle inline-flex h-[1.125rem] w-[1.125rem] flex-none cursor-[inherit] items-center justify-center rounded border-none bg-transparent p-0 text-gray-400 dark:text-zinc-500"
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
          @if (node.locked) {
            <ng-icon
              class="ml-auto text-base text-gray-400 dark:text-zinc-500"
              name="heroLockClosedMini"
            />
          }
        </li>
      }
    </ul>
  `,
})
export default class TreeDisabledExample {
  readonly nodes: FileNode[] = [
    {
      id: 'src',
      name: 'src',
      children: [
        { id: 'index.ts', name: 'index.ts' },
        { id: 'secrets.ts', name: 'secrets.ts', locked: true },
      ],
    },
    {
      id: 'node_modules',
      name: 'node_modules',
      locked: true,
      children: [{ id: 'dep', name: 'some-dependency' }],
    },
    { id: 'package.json', name: 'package.json' },
  ];

  readonly expanded = new Set(['src']);

  readonly children = (node: FileNode) => node.children;
  readonly itemValue = (node: FileNode) => node.id;
  readonly itemLabel = (node: FileNode) => node.name;
  readonly itemDisabled = (node: FileNode) => node.locked === true;
}
