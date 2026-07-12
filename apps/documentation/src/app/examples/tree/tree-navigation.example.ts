import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronRightMini } from '@ng-icons/heroicons/mini';
import { NgpTree, NgpTreeNode, NgpTreeNodeToggle } from 'ng-primitives/tree';

interface Category {
  id: string;
  label: string;
  count?: number;
  children?: Category[];
}

@Component({
  selector: 'app-tree-navigation',
  imports: [NgpTree, NgpTreeNode, NgpTreeNodeToggle, NgIcon],
  providers: [provideIcons({ heroChevronRightMini })],
  styles: `
    :host {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    [ngpTree] {
      width: 100%;
      max-width: 18rem;
      margin: 0;
      padding: 0.375rem;
      list-style: none;
      border-radius: 0.75rem;
      border: 1px solid var(--ngp-border);
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-shadow);
      outline: none;
    }

    [ngpTreeNode] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-left: calc((var(--ngp-tree-node-level) - 1) * 1rem + 0.5rem);
      padding-right: 0.625rem;
      height: 2rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      cursor: pointer;
      user-select: none;
      outline: none;
    }

    [ngpTreeNode]:hover {
      background-color: var(--ngp-background-hover);
    }

    [ngpTreeNode]:focus-visible {
      box-shadow: 0 0 0 2px var(--ngp-focus-ring);
    }

    /* The activated ("current") item, set from (ngpTreeActivate). */
    [ngpTreeNode][data-active] {
      color: var(--ngp-primary);
    }

    [ngpTreeNodeToggle] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 1rem;
      height: 1rem;
      padding: 0;
      border: none;
      border-radius: 0.25rem;
      background: transparent;
      color: var(--ngp-text-tertiary);
      cursor: pointer;
    }

    [ngpTreeNodeToggle] ng-icon {
      font-size: 0.9375rem;
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpTreeNodeToggle][data-expanded] ng-icon {
      transform: rotate(90deg);
    }

    .spacer {
      flex: none;
      width: 1rem;
      height: 1rem;
    }

    .count {
      margin-left: auto;
      min-width: 1.25rem;
      padding: 0 0.375rem;
      height: 1.125rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 590;
      color: var(--ngp-text-secondary);
      background-color: var(--ngp-background-hover);
      border-radius: 9999px;
    }
  `,
  template: `
    <ul
      #tree="ngpTree"
      [ngpTreeNodes]="nodes"
      [ngpTreeItemChildren]="children"
      [ngpTreeItemValue]="itemValue"
      [ngpTreeItemLabel]="itemLabel"
      [ngpTreeDefaultExpandedKeys]="expanded"
      (ngpTreeActivate)="active.set(itemValue($event))"
      ngpTree
    >
      @for (node of tree.visibleNodes(); track itemValue(node)) {
        <li
          #n="ngpTreeNode"
          [ngpTreeNode]="node"
          [attr.data-active]="active() === node.id ? '' : null"
          ngpTreeNode
        >
          @if (n.expandable()) {
            <button [attr.data-expanded]="n.expanded() ? '' : null" ngpTreeNodeToggle>
              <ng-icon name="heroChevronRightMini" />
            </button>
          } @else {
            <span class="spacer"></span>
          }
          <span>{{ node.label }}</span>
          @if (node.count !== undefined) {
            <span class="count">{{ node.count }}</span>
          }
        </li>
      }
    </ul>
  `,
})
export default class TreeNavigationExample {
  readonly nodes: Category[] = [
    {
      id: 'clothing',
      label: 'Clothing',
      children: [
        {
          id: 'mens',
          label: "Men's",
          children: [
            { id: 'shirts', label: 'Shirts', count: 42 },
            { id: 'trousers', label: 'Trousers', count: 28 },
          ],
        },
        {
          id: 'womens',
          label: "Women's",
          children: [
            { id: 'dresses', label: 'Dresses', count: 63 },
            { id: 'knitwear', label: 'Knitwear', count: 31 },
          ],
        },
      ],
    },
    {
      id: 'electronics',
      label: 'Electronics',
      children: [
        { id: 'phones', label: 'Phones', count: 17 },
        { id: 'laptops', label: 'Laptops', count: 24 },
      ],
    },
    { id: 'gift-cards', label: 'Gift Cards', count: 5 },
  ];

  readonly expanded = new Set(['clothing', 'mens']);

  /** The activated ("current") item - double-click or press Enter to change it. */
  readonly active = signal('shirts');

  readonly children = (node: Category) => node.children;
  readonly itemValue = (node: Category) => node.id;
  readonly itemLabel = (node: Category) => node.label;
}
