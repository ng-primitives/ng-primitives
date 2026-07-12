import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronRightMini,
  heroDocumentMini,
  heroFolderMini,
  heroFolderOpenMini,
} from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';
import { NgpTreeDropEvent } from 'ng-primitives/tree';

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
    const child = list[i].children;
    if (child) {
      const found = extract(child, id);
      if (found) {
        return found;
      }
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
    const child = list[i].children;
    if (child) {
      const found = locate(child, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function find(list: FileNode[], id: string): FileNode | null {
  return locate(list, id)?.list[locate(list, id)!.index] ?? null;
}

let copySeq = 0;

/** Deep-copy a node, giving it (and its descendants) fresh ids. */
function copyOf(node: FileNode): FileNode {
  const clone = structuredClone(node);
  const renumber = (n: FileNode) => {
    n.id = `${n.id}-copy-${copySeq++}`;
    n.children?.forEach(renumber);
  };
  renumber(clone);
  return clone;
}

@Component({
  selector: 'app-tree-dnd',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [
    provideIcons({ heroChevronRightMini, heroFolderMini, heroFolderOpenMini, heroDocumentMini }),
  ],
  template: `
    <div class="flex w-full flex-col items-center gap-3">
      <ul
        class="m-0 min-h-56 w-full max-w-80 list-none rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm outline-none data-root-drop:ring-[1.5px] data-root-drop:ring-[#f01e2b] dark:border-zinc-800 dark:bg-zinc-950 dark:data-root-drop:ring-[#ff4651]"
        #tree="ngpTree"
        [ngpTreeNodes]="nodes()"
        [ngpTreeItemChildren]="children"
        [ngpTreeItemValue]="itemValue"
        [ngpTreeItemLabel]="itemLabel"
        [ngpTreeDefaultExpandedKeys]="expanded"
        [ngpTreeCanDrop]="canDrop"
        [ngpTreeItemDraggable]="true"
        (ngpTreeDrop)="onDrop($event)"
        ngpTreeSelectionMode="multiple"
        ngpTree
      >
        @for (node of tree.visibleNodes(); track itemValue(node)) {
          <li
            class="relative flex h-8 cursor-grab items-center gap-1.5 rounded-lg pr-2 pl-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] text-sm tracking-[-0.006em] text-gray-900 outline-none select-none hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-blue-500 data-cut:opacity-[0.55] data-cut:outline-1 data-cut:[outline-offset:-1px] data-cut:outline-gray-200 data-cut:outline-dashed data-dragging:opacity-[0.35] data-selected:bg-[#f01e2b]/10 data-[drop-position=after]:after:absolute data-[drop-position=after]:after:right-2 data-[drop-position=after]:after:-bottom-px data-[drop-position=after]:after:left-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] data-[drop-position=after]:after:h-[1.5px] data-[drop-position=after]:after:rounded-[1px] data-[drop-position=after]:after:bg-[#f01e2b] data-[drop-position=after]:after:[box-shadow:-3px_0_0_-1px_#fff,-3px_0_0_0.5px_#f01e2b] data-[drop-position=before]:after:absolute data-[drop-position=before]:after:-top-px data-[drop-position=before]:after:right-2 data-[drop-position=before]:after:left-[calc((var(--ngp-tree-node-level)-1)*1.125rem+0.375rem)] data-[drop-position=before]:after:h-[1.5px] data-[drop-position=before]:after:rounded-[1px] data-[drop-position=before]:after:bg-[#f01e2b] data-[drop-position=before]:after:[box-shadow:-3px_0_0_-1px_#fff,-3px_0_0_0.5px_#f01e2b] data-[drop-position=inside]:bg-[#f01e2b]/[0.12] data-[drop-position=inside]:shadow-[inset_0_0_0_1.5px_#f01e2b] dark:text-zinc-100 dark:hover:bg-zinc-900 dark:focus-visible:ring-blue-400 dark:data-cut:outline-zinc-800 dark:data-selected:bg-[#ff4651]/10 dark:data-[drop-position=after]:after:bg-[#ff4651] dark:data-[drop-position=after]:after:[box-shadow:-3px_0_0_-1px_#09090b,-3px_0_0_0.5px_#ff4651] dark:data-[drop-position=before]:after:bg-[#ff4651] dark:data-[drop-position=before]:after:[box-shadow:-3px_0_0_-1px_#09090b,-3px_0_0_0.5px_#ff4651] dark:data-[drop-position=inside]:bg-[#ff4651]/[0.12] dark:data-[drop-position=inside]:shadow-[inset_0_0_0_1.5px_#ff4651]"
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
      </ul>

      <p class="max-w-96 text-center text-xs tracking-[-0.011em] text-gray-400 dark:text-zinc-500">
        Click to select, ⌘/Ctrl-click for multiple. Drag to move (hold Alt to copy, or drop below
        the list to move to the root), or cut & paste with ⌘/Ctrl+X then V.
      </p>
    </div>
  `,
})
export default class TreeDndExample {
  readonly nodes = signal<FileNode[]>([
    {
      id: 'src',
      name: 'src',
      folder: true,
      children: [
        { id: 'app.ts', name: 'app.ts' },
        { id: 'main.ts', name: 'main.ts' },
        { id: 'styles.css', name: 'styles.css' },
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

  // Only folders can receive a node dropped "inside" them; files can only be
  // reordered before/after. A null target is a drop onto the tree root.
  readonly canDrop = ({ target, position }: NgpTreeDropEvent<FileNode>): boolean =>
    target === null || position !== 'inside' || !!target.folder;

  readonly onDrop = ({ sources, target, position, effect }: NgpTreeDropEvent<FileNode>): void => {
    const data = structuredClone(this.nodes());
    // A copy (Alt/Option held) duplicates the nodes; a move relocates them.
    const moved =
      effect === 'copy'
        ? sources.map(source => copyOf(source))
        : sources
            .map(source => extract(data, source.id))
            .filter((node): node is FileNode => node !== null);
    if (moved.length === 0) {
      return;
    }

    if (target === null) {
      // Dropped over empty space -> move to the root.
      data.push(...moved);
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
