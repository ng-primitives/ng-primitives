import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCog6Tooth, heroDocument, heroFolder } from '@ng-icons/heroicons/outline';
import { Toolbar } from './toolbar';
import { ToolbarButton } from './toolbar-button';

@Component({
  selector: 'app-toolbar-example',
  imports: [Toolbar, ToolbarButton, NgIcon],
  providers: [
    provideIcons({
      heroDocument,
      heroFolder,
      heroCog6Tooth,
    }),
  ],
  template: `
    <app-toolbar>
      <button app-toolbar-button aria-label="New Document">
        <ng-icon name="heroDocument" />
      </button>
      <button app-toolbar-button aria-label="New Folder">
        <ng-icon name="heroFolder" />
      </button>
      <button app-toolbar-button aria-label="Settings">
        <ng-icon name="heroCog6Tooth" />
      </button>
    </app-toolbar>
  `,
})
export default class App {}
