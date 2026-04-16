import { Component } from '@angular/core';
import { NgpContextMenuTrigger } from 'ng-primitives/context-menu';
import { ContextMenu } from './context-menu';
import { ContextMenuItem } from './context-menu-item';

@Component({
  selector: 'app-context-menu-example',
  imports: [ContextMenu, NgpContextMenuTrigger, ContextMenuItem],
  template: `
    <div [ngpContextMenuTrigger]="menu">Right-click me</div>

    <ng-template #menu>
      <app-context-menu>
        <button app-context-menu-item>Cut</button>
        <button app-context-menu-item>Copy</button>
        <button app-context-menu-item>Paste</button>
      </app-context-menu>
    </ng-template>
  `,
  styles: `
    [ngpContextMenuTrigger] {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 300px;
      height: 150px;
      border: 2px dashed var(--ngp-border);
      border-radius: 8px;
      color: var(--ngp-text-secondary);
      font-size: 14px;
      user-select: none;
    }
  `,
})
export default class App {}
