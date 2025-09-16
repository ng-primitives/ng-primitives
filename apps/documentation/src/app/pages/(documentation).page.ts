import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { saxMoonOutline } from '@ng-icons/iconsax/outline';
import { filter } from 'rxjs';
import { Navbar } from '../components/navbar/navbar';
import { SideNavigation } from '../components/side-navigation/side-navigation';

@Component({
  selector: 'docs-documentation-layout',
  imports: [RouterOutlet, Navbar, SideNavigation],
  providers: [provideIcons({ saxMoonOutline })],
  template: `
    <docs-navbar [(menuOpen)]="menuOpen" />

    <div class="px-8 pt-24">
      <div class="flex">
        <docs-side-navigation [(menuOpen)]="menuOpen" />

        <router-outlet />
      </div>
      <p class="px-8 py-8 text-center text-xs text-zinc-500">
        Copyright © {{ year }} Angular Primitives
      </p>
    </div>
  `,
})
export default class DocumentationLayoutPage {
  private readonly router = inject(Router);
  private readonly platform = inject(PLATFORM_ID);
  readonly year = new Date().getFullYear();

  readonly menuOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));

    if (isPlatformBrowser(this.platform)) {
      effect(() => {
        // if the menu is open prevent scrolling on the body
        if (this.menuOpen()) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      });
    }
  }
}
