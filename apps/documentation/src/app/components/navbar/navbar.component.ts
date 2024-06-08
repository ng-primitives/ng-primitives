import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { RouterLink } from '@angular/router';
import { bootstrapGithub } from '@ng-icons/bootstrap-icons';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMenu, lucideSearch } from '@ng-icons/lucide';

@Component({
  selector: 'docs-navbar',
  standalone: true,
  imports: [NgIcon, RouterLink],
  viewProviders: [provideIcons({ lucideSearch, bootstrapGithub, lucideMenu })],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  /**
   * Whether the mobile menu is open.
   */
  readonly menuOpen = model(false);

  toggle(): void {
    this.menuOpen.update(open => !open);
  }
}
