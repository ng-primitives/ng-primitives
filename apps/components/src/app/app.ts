import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  template: `
    <nav>
      <a routerLink="/accordion">Accordion</a>
      <a routerLink="/avatar">Avatar</a>
      <a routerLink="/button">Button</a>
      <a routerLink="/checkbox">Checkbox</a>
      <a routerLink="/input">Input</a>
      <a routerLink="/date-picker">Date Picker</a>
      <a routerLink="/form-field">Form Field</a>
      <a routerLink="/slider">Slider</a>
      <a routerLink="/pagination">Pagination</a>
      <a routerLink="/progress">Progress</a>
      <a routerLink="/radio">Radio</a>
      <a routerLink="/switch">Switch</a>
      <a routerLink="/toggle">Toggle</a>
      <a routerLink="/toggle-group">Toggle Group</a>
      <a routerLink="/tabs">Tabs</a>
      <a routerLink="/listbox">Listbox</a>
      <a routerLink="/separator">Separator</a>
      <a routerLink="/textarea">Textarea</a>
      <a routerLink="/dialog">Dialog</a>
      <a routerLink="/file-upload">File Upload</a>
      <a routerLink="/search">Search</a>
      <a routerLink="/toast">Toast</a>
      <a routerLink="/toolbar">Toolbar</a>
      <a routerLink="/tooltip">Tooltip</a>
      <a routerLink="/meter">Meter</a>
      <a routerLink="/menu">Menu</a>
      <a routerLink="/popover">Popover</a>
      <a routerLink="/combobox">Combobox</a>
    </nav>
    <main>
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: flex;
    }

    nav {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: none;
    }

    main {
      flex: 1;
    }
  `,
})
export class App {}
