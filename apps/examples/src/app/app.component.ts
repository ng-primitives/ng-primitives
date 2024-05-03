import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  selector: 'app-root',
  template: `
    <router-outlet />
  `,
  host: {
    class: 'flex items-center justify-center h-full p-4',
  },
})
export class AppComponent {}
