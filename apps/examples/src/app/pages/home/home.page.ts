import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <ul>
      <li><a routerLink="/examples/accordion">Accordion</a></li>
      <li><a routerLink="/examples/checkbox">Checkbox</a></li>
      <li><a routerLink="/examples/progress">Progess</a></li>
      <li><a routerLink="/examples/switch">Switch</a></li>
    </ul>
  `,
})
export default class HomePage {}
