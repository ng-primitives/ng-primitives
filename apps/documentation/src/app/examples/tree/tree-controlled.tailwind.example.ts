import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronRightMini,
  heroDocumentMini,
  heroFolderMini,
  heroFolderOpenMini,
} from '@ng-icons/heroicons/mini';
import { NgpButton } from 'ng-primitives/button';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface FileNode {
  id: string;
  name: string;
  children?: FileNode[];
}

const DATA: FileNode[] = [
  {
    id: 'src',
    name: 'src',
    children: [
      {
        id: 'app',
        name: 'app',
        children: [
          { id: 'app.component.ts', name: 'app.component.ts' },
          { id: 'app.config.ts', name: 'app.config.ts' },
        ],
      },
      { id: 'main.ts', name: 'main.ts' },
    ],
  },
  { id: 'public', name: 'public', children: [{ id: 'favicon.ico', name: 'favicon.ico' }] },
  { id: 'package.json', name: 'package.json' },
];

/** Collect every expandable (folder) id so "Expand all" can open the whole tree. */
function allFolderIds(nodes: FileNode[], acc: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children?.length) {
      acc.push(node.id);
      allFolderIds(node.children, acc);
    }
  }
  return acc;
}

@Component({
  selector: 'app-tree-controlled',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgpButton, NgIcon],
  providers: [
    provideIcons({ heroChevronRightMini, heroFolderMini, heroFolderOpenMini, heroDocumentMini }),
  ],
  template: `
    <div class="mb-3 flex justify-center gap-2">
      <button
        class="h-8 cursor-pointer rounded-lg px-3 text-[0.8125rem] font-[510] tracking-[-0.006em] text-gray-900 shadow-[inset_0_0_0_1px_#e5e7eb,0_1px_2px_0_rgba(0,0,0,0.04)] outline-none data-focus-visible:shadow-[inset_0_0_0_1px_#e5e7eb,0_0_0_2px_#3b82f6] data-hover:bg-gray-100 dark:text-zinc-100 dark:shadow-[inset_0_0_0_1px_#27272a,0_1px_2px_0_rgba(0,0,0,0.04)] dark:data-focus-visible:shadow-[inset_0_0_0_1px_#27272a,0_0_0_2px_#60a5fa] dark:data-hover:bg-zinc-900"
        (click)="expandAll()"
        ngpButton
      >
        Expand all
      </button>
      <button
        class="h-8 cursor-pointer rounded-lg px-3 text-[0.8125rem] font-[510] tracking-[-0.006em] text-gray-900 shadow-[inset_0_0_0_1px_#e5e7eb,0_1px_2px_0_rgba(0,0,0,0.04)] outline-none data-focus-visible:shadow-[inset_0_0_0_1px_#e5e7eb,0_0_0_2px_#3b82f6] data-hover:bg-gray-100 dark:text-zinc-100 dark:shadow-[inset_0_0_0_1px_#27272a,0_1px_2px_0_rgba(0,0,0,0.04)] dark:data-focus-visible:shadow-[inset_0_0_0_1px_#27272a,0_0_0_2px_#60a5fa] dark:data-hover:bg-zinc-900"
        (click)="collapseAll()"
        ngpButton
      >
        Collapse all
      </button>
    </div>

    <ul
      class="m-0 mx-auto w-full max-w-80 list-none rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
      #tree="ngpTree"
      [ngpTreeNodes]="nodes"
      [ngpTreeChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeExpandedKeys]="expanded()"
      (ngpTreeExpandedKeysChange)="expanded.set($event)"
      ngpTree
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li
          class="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg pr-2 pl-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] text-sm tracking-[-0.006em] text-gray-900 outline-none select-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:ring-blue-400"
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
export default class TreeControlledExample {
  readonly nodes = DATA;
  readonly expanded = signal<ReadonlySet<string>>(new Set(['src']));

  readonly children = (node: FileNode) => node.children;
  readonly itemValue = (node: FileNode) => node.id;
  readonly itemLabel = (node: FileNode) => node.name;

  expandAll(): void {
    this.expanded.set(new Set(allFolderIds(this.nodes)));
  }

  collapseAll(): void {
    this.expanded.set(new Set());
  }
}
