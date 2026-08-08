import { Component } from '@angular/core';
import { Tree, TreeNode } from './tree';

@Component({
  selector: 'app-tree-example',
  imports: [Tree],
  template: `
    <app-tree [nodes]="nodes" [defaultExpandedKeys]="expanded" />
  `,
})
export default class App {
  readonly nodes: TreeNode[] = [
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
}
