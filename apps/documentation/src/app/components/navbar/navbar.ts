import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
  model,
} from '@angular/core';
import { bootstrapDiscord, bootstrapGithub } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMenu, lucideSearch } from '@ng-icons/lucide';
import { NgpButton } from 'ng-primitives/button';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'docs-navbar',
  imports: [NgIcon, NgpButton, ThemeToggle],
  providers: [provideIcons({ lucideSearch, bootstrapGithub, bootstrapDiscord, lucideMenu })],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar implements OnInit {
  /**
   * Determine the platform.
   */
  private readonly platform = inject(PLATFORM_ID);

  /**
   * Whether the mobile menu is open.
   */
  readonly menuOpen = model(false);

  async ngOnInit() {
    if (isPlatformBrowser(this.platform)) {
      const { default: docsearch } = await import('@docsearch/js');

      docsearch({
        appId: 'HTXZ7INLYZ',
        apiKey: 'ca9b161cfa378ce0410efcfd7cbedb47',
        indexName: 'angularprimitives',
        container: '#docsearch',
      });
    }
  }

  toggle(): void {
    this.menuOpen.update(open => !open);
  }
}
