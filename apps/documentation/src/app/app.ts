import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'docs-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet />
  `,
})
export class App {}
