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
  NgpTreeDragPreview,
  NgpTreeDropEvent,
  NgpTreeNode,
  NgpTreeNodeToggle,
} from 'ng-primitives/tree';

interface FileNode {
  id: string;
  name: string;
  folder?: boolean;
  children?: FileNode[];
}

/** Remove the node with `id`, returning it. */
function extract(list: FileNode[], id: string): FileNode | null {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return list.splice(i, 1)[0];
    }
    const found = list[i].children && extract(list[i].children!, id);
    if (found) {
      return found;
    }
  }
  return null;
}

/** Find the list + index that directly contains `id`. */
function locate(list: FileNode[], id: string): { list: FileNode[]; index: number } | null {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return { list, index: i };
    }
    const found = list[i].children && locate(list[i].children!, id);
    if (found) {
      return found;
    }
  }
  return null;
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
  selector: 'app-tree-drag-preview',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgpTreeDragPreview, NgIcon],
  providers: [
    provideIcons({ heroChevronRightMini, heroFolderMini, heroFolderOpenMini, heroDocumentMini }),
  ],
  template: `
    <ul
      class="m-0 mx-auto w-full max-w-80 list-none rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none dark:border-zinc-800 dark:bg-zinc-950"
      #tree="ngpTree"
      [ngpTreeNodes]="nodes()"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeDefaultExpandedKeys]="expanded"
      [ngpTreeCanDrop]="canDrop"
      [ngpTreeItemDraggable]="true"
      (ngpTreeDrop)="onDrop($event)"
      ngpTree
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li
          class="relative flex h-8 cursor-grab items-center gap-1.5 rounded-lg pr-2 pl-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] text-sm tracking-[-0.006em] text-gray-900 outline-none select-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 data-dragging:opacity-[0.35] data-[drop-position=after]:after:absolute data-[drop-position=after]:after:right-2 data-[drop-position=after]:after:-bottom-px data-[drop-position=after]:after:left-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] data-[drop-position=after]:after:h-[1.5px] data-[drop-position=after]:after:rounded-[1px] data-[drop-position=after]:after:bg-[#f01e2b] data-[drop-position=after]:after:[box-shadow:-3px_0_0_-1px_#fff,-3px_0_0_0.5px_#f01e2b] data-[drop-position=before]:after:absolute data-[drop-position=before]:after:-top-px data-[drop-position=before]:after:right-2 data-[drop-position=before]:after:left-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] data-[drop-position=before]:after:h-[1.5px] data-[drop-position=before]:after:rounded-[1px] data-[drop-position=before]:after:bg-[#f01e2b] data-[drop-position=before]:after:[box-shadow:-3px_0_0_-1px_#fff,-3px_0_0_0.5px_#f01e2b] data-[drop-position=inside]:bg-[#f01e2b]/[0.12] data-[drop-position=inside]:shadow-[inset_0_0_0_1.5px_#f01e2b] dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:ring-blue-400 dark:data-[drop-position=after]:after:bg-[#ff4651] dark:data-[drop-position=after]:after:[box-shadow:-3px_0_0_-1px_#09090b,-3px_0_0_0.5px_#ff4651] dark:data-[drop-position=before]:after:bg-[#ff4651] dark:data-[drop-position=before]:after:[box-shadow:-3px_0_0_-1px_#09090b,-3px_0_0_0.5px_#ff4651] dark:data-[drop-position=inside]:bg-[#ff4651]/[0.12] dark:data-[drop-position=inside]:shadow-[inset_0_0_0_1.5px_#ff4651]"
          #n="ngpTreeNode"
          [ngpTreeNode]="node"
          ngpTreeNode
        >
          @if (n.expandable()) {
            <button
              class="group inline-flex h-[1.125rem] w-[1.125rem] flex-none cursor-pointer items-center justify-center rounded border-none bg-transparent p-0 text-gray-400 dark:text-zinc-500"
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

      <!-- Custom floating preview: a red pill instead of the default row clone. -->
      <ng-template ngpTreeDragPreview let-node>
        <div
          class="inline-flex rotate-[-2deg] items-center gap-2 rounded-full bg-[#f01e2b] px-3 py-1.5 text-[0.8125rem] font-[510] tracking-[-0.006em] text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.35)] dark:bg-[#ff4651]"
        >
          <ng-icon class="text-base" [name]="node.folder ? 'heroFolderMini' : 'heroDocumentMini'" />
          {{ node.name }}
        </div>
      </ng-template>
    </ul>
  `,
})
export default class TreeDragPreviewExample {
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
    {
      id: 'assets',
      name: 'assets',
      folder: true,
      children: [{ id: 'logo.svg', name: 'logo.svg' }],
    },
    { id: 'package.json', name: 'package.json' },
    { id: 'readme', name: 'README.md' },
  ]);

  readonly expanded = new Set(['src', 'assets']);

  readonly children = (node: FileNode) => node.children;
  readonly itemValue = (node: FileNode) => node.id;
  readonly itemLabel = (node: FileNode) => node.name;

  readonly canDrop = ({ target, position }: NgpTreeDropEvent<FileNode>): boolean =>
    target === null || position !== 'inside' || !!target.folder;

  readonly onDrop = ({ sources, target, position }: NgpTreeDropEvent<FileNode>): void => {
    const data = structuredClone(this.nodes());
    const moved = sources
      .map(source => extract(data, source.id))
      .filter((node): node is FileNode => node !== null);
    if (moved.length === 0) {
      return;
    }

    if (target === null) {
      data.push(...moved); // dropped over empty space -> root
    } else if (position === 'inside') {
      const parent = find(data, target.id);
      if (parent) {
        parent.children = [...moved, ...(parent.children ?? [])];
      }
    } else {
      const at = locate(data, target.id);
      if (at) {
        at.list.splice(position === 'before' ? at.index : at.index + 1, 0, ...moved);
      }
    }

    this.nodes.set(data);
  };
}
