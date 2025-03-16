import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  template: `
    <nav>
      <a routerLink="/accordion">Accordion</a>
      <a routerLink="/button">Button</a>
      <a routerLink="/input">Input</a>
    </nav>
    <router-outlet />
  `,
  styles: `
    nav {
      display: flex;
      gap: 1rem;
    }
  `,
})
export class App {}
