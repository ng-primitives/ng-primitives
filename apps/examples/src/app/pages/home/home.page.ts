import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <ul>
      @for (page of pages; track page) {
        <li>
          <a class="capitalize" routerLink="/examples/{{ page }}">{{ page }}</a>
        </li>
      }
    </ul>
  `,
})
export default class HomePage {
  readonly pages: string[] = [
    'accordion',
    'avatar',
    'checkbox',
    'progress',
    'switch',
    'toggle',
    'tooltip',
  ];
}
