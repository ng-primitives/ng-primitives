import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  PLATFORM_ID,
  inject,
  model,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { bootstrapDiscord, bootstrapGithub } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMenu, lucideSearch } from '@ng-icons/lucide';
import { NgpButton } from 'ng-primitives/button';
import { NgpHover } from 'ng-primitives/interactions';
import { ThemeTogglerComponent } from '../theme-toggler/theme-toggler.component';

@Component({
  selector: 'docs-navbar',
  imports: [NgIcon, RouterLink, NgpHover, NgpButton, ThemeTogglerComponent],
  viewProviders: [provideIcons({ lucideSearch, bootstrapGithub, bootstrapDiscord, lucideMenu })],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent implements OnInit {
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
