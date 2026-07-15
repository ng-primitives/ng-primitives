import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronRightMini,
  heroDocumentMini,
  heroFolderMini,
  heroFolderOpenMini,
} from '@ng-icons/heroicons/mini';
import {
  NgpTree,
  NgpTreeNode,
  NgpTreeNodeRename,
  NgpTreeNodeToggle,
  NgpTreeRenameEvent,
} from 'ng-primitives/tree';

interface FileNode {
  id: string;
  name: string;
  folder?: boolean;
  children?: FileNode[];
}

/** Find the node with `id`. */
function find(list: FileNode[], id: string): FileNode | null {
  for (const node of list) {
    if (node.id === id) {
      return node;
    }
    const found = node.children && find(node.children, id);
    if (found) {
      return found;
    }
  }
  return null;
}

@Component({
  selector: 'app-tree-rename',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgpTreeNodeRename, NgIcon],
  providers: [
    provideIcons({ heroChevronRightMini, heroFolderMini, heroFolderOpenMini, heroDocumentMini }),
  ],
  host: {
    class: 'flex w-full flex-col items-center gap-3',
  },
  template: `
    <ul
      class="m-0 w-full max-w-80 list-none rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
      #tree="ngpTree"
      [ngpTreeNodes]="nodes()"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeDefaultExpandedKeys]="expanded"
      [ngpTreeItemRenamable]="true"
      (ngpTreeRename)="onRename($event)"
      ngpTree
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li
          class="relative flex h-8 touch-manipulation items-center gap-1.5 rounded-lg pr-2 pl-[calc((var(--ngp-tree-node-level)_-_1)_*_1.125rem_+_0.375rem)] text-sm tracking-[-0.006em] text-gray-900 outline-none select-none data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-hover:bg-gray-100 data-renaming:bg-transparent dark:text-zinc-100 dark:data-focus-visible:ring-blue-400 dark:data-hover:bg-zinc-900"
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
              node.folder
                ? n.expanded()
                  ? 'heroFolderOpenMini'
                  : 'heroFolderMini'
                : 'heroDocumentMini'
            "
          />
          @if (n.renaming()) {
            <input
              class="my-0 mr-0 ml-[calc(-0.25rem_-_1px)] min-w-0 flex-auto rounded border border-blue-500 bg-white px-1 py-0 text-sm tracking-[-0.006em] text-gray-900 outline-none dark:border-blue-400 dark:bg-zinc-950 dark:text-zinc-100"
              [value]="node.name"
              [attr.aria-label]="'Rename ' + node.name"
              ngpTreeNodeRename
            />
          } @else {
            <span class="overflow-hidden text-ellipsis whitespace-nowrap">{{ node.name }}</span>
          }
        </li>
      }
    </ul>

    <p class="text-xs tracking-[-0.011em] text-gray-400 dark:text-zinc-500">
      Double-click a row or press
      <kbd>F2</kbd>
      to rename. Enter saves, Escape cancels.
    </p>
  `,
})
export default class TreeRenameExample {
  readonly nodes = signal<FileNode[]>([
    {
      id: 'src',
      name: 'src',
      folder: true,
      children: [
        { id: 'app.ts', name: 'app.ts' },
        { id: 'main.ts', name: 'main.ts' },
      ],
    },
    { id: 'package.json', name: 'package.json' },
    { id: 'readme', name: 'README.md' },
  ]);

  readonly expanded = new Set(['src']);

  readonly children = (node: FileNode) => node.children;
  readonly itemValue = (node: FileNode) => node.id;
  readonly itemLabel = (node: FileNode) => node.name;

  readonly onRename = ({ node, value }: NgpTreeRenameEvent<FileNode>): void => {
    const data = structuredClone(this.nodes());
    const match = find(data, node.id);
    if (match) {
      match.name = value;
      this.nodes.set(data);
    }
  };
}
