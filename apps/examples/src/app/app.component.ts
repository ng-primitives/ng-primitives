import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterOutlet],
  selector: 'app-root',
  template: `<router-outlet />`,
  host: {
    class: 'flex items-center justify-center h-full',
  },
})
export class AppComponent {}
