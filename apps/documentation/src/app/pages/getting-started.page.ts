import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuickLinksComponent } from '../components/quick-links/quick-links.component';

@Component({
  standalone: true,
  selector: 'docs-getting-started',
  template: `
    <div class="flex gap-x-12">
      <div class="prose prose-sm prose-zinc flex-1">
        <router-outlet />
      </div>
      <docs-quick-links />
    </div>
  `,
  imports: [RouterOutlet, QuickLinksComponent],
  host: {
    class: 'flex-1',
  },
})
export default class GettingStartedPage {}
