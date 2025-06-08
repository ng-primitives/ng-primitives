import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  template: `
    <nav>
      <a routerLink="/reusable-components/accordion">Accordion</a>
      <a routerLink="/reusable-components/avatar">Avatar</a>
      <a routerLink="/reusable-components/button">Button</a>
      <a routerLink="/reusable-components/checkbox">Checkbox</a>
      <a routerLink="/reusable-components/combobox">Combobox</a>
      <a routerLink="/reusable-components/date-picker">Date Picker</a>
      <a routerLink="/reusable-components/dialog">Dialog</a>
      <a routerLink="/reusable-components/file-upload">File Upload</a>
      <a routerLink="/reusable-components/form-field">Form Field</a>
      <a routerLink="/reusable-components/input">Input</a>
      <a routerLink="/reusable-components/listbox">Listbox</a>
      <a routerLink="/reusable-components/menu">Menu</a>
      <a routerLink="/reusable-components/meter">Meter</a>
      <a routerLink="/reusable-components/pagination">Pagination</a>
      <a routerLink="/reusable-components/popover">Popover</a>
      <a routerLink="/reusable-components/progress">Progress</a>
      <a routerLink="/reusable-components/radio">Radio</a>
      <a routerLink="/reusable-components/search">Search</a>
      <a routerLink="/reusable-components/separator">Separator</a>
      <a routerLink="/reusable-components/slider">Slider</a>
      <a routerLink="/reusable-components/switch">Switch</a>
      <a routerLink="/reusable-components/tabs">Tabs</a>
      <a routerLink="/reusable-components/textarea">Textarea</a>
      <a routerLink="/reusable-components/toast">Toast</a>
      <a routerLink="/reusable-components/toggle-group">Toggle Group</a>
      <a routerLink="/reusable-components/toggle">Toggle</a>
      <a routerLink="/reusable-components/toolbar">Toolbar</a>
      <a routerLink="/reusable-components/tooltip">Tooltip</a>
      <a routerLink="/reusable-components/select">Select</a>
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
