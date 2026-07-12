import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowPathMini,
  heroChevronRightMini,
  heroDocumentMini,
  heroFolderMini,
  heroFolderOpenMini,
} from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface RemoteNode {
  id: string;
  name: string;
  folder?: boolean;
  children?: RemoteNode[];
}

let counter = 0;

@Component({
  selector: 'app-tree-async',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [
    provideIcons({
      heroChevronRightMini,
      heroFolderMini,
      heroFolderOpenMini,
      heroDocumentMini,
      heroArrowPathMini,
    }),
  ],
  template: `
    <ul
      class="mx-auto w-full max-w-80 list-none rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
      #tree="ngpTree"
      [ngpTreeNodes]="nodes"
      [ngpTreeChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeItemExpandable]="isExpandable"
      [ngpTreeItemLoadChildren]="loadChildren"
      ngpTree
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li
          class="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg pr-2 pl-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] text-sm tracking-[-0.006em] text-gray-900 outline-none select-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:ring-blue-400"
          #n="ngpTreeNode"
          [ngpTreeNode]="node"
          ngpTreeNode
        >
          @if (n.loading()) {
            <span
              class="inline-flex h-[1.125rem] w-[1.125rem] flex-none items-center justify-center text-gray-400 dark:text-zinc-500"
            >
              <ng-icon
                class="animate-[spin_0.7s_linear_infinite] text-base"
                name="heroArrowPathMini"
              />
            </span>
          } @else if (n.expandable()) {
            <button
              class="inline-flex h-[1.125rem] w-[1.125rem] flex-none cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-gray-400 transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] data-expanded:rotate-90 dark:text-zinc-500"
              [attr.data-expanded]="n.expanded() ? '' : null"
              ngpTreeNodeToggle
            >
              <ng-icon class="text-base" name="heroChevronRightMini" />
            </button>
          } @else {
            <span class="h-[1.125rem] w-[1.125rem] flex-none"></span>
          }
          <ng-icon
            class="flex-none text-[1.125rem] text-gray-400 dark:text-zinc-500"
            [name]="
              node.folder
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
export default class TreeAsyncExample {
  readonly nodes: RemoteNode[] = [
    { id: 'documents', name: 'Documents', folder: true },
    { id: 'photos', name: 'Photos', folder: true },
    { id: 'readme', name: 'README.md' },
  ];

  readonly children = (node: RemoteNode) => node.children;
  readonly itemValue = (node: RemoteNode) => node.id;
  readonly itemLabel = (node: RemoteNode) => node.name;
  readonly isExpandable = (node: RemoteNode) => node.folder === true;

  // Simulate a network request that resolves after a short delay.
  readonly loadChildren = (node: RemoteNode): Promise<RemoteNode[]> =>
    new Promise(resolve =>
      setTimeout(() => {
        const folder = counter++ % 2 === 0;
        resolve([
          { id: `${node.id}-a`, name: folder ? 'Subfolder' : 'file-a.txt', folder },
          { id: `${node.id}-b`, name: 'file-b.txt' },
          { id: `${node.id}-c`, name: 'file-c.txt' },
        ]);
      }, 700),
    );
}
