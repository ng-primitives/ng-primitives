import { isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { saxMoonOutline } from '@ng-icons/iconsax/outline';
import { filter } from 'rxjs';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SideNavigationComponent } from './components/side-navigation/side-navigation.component';

@Component({
  selector: 'docs-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIcon, NavbarComponent, SideNavigationComponent],
  viewProviders: [provideIcons({ saxMoonOutline })],
  template: `
    <docs-navbar [(menuOpen)]="menuOpen" />

    <div class="container mx-auto px-8 pt-24">
      <div class="flex">
        <docs-side-navigation class="md:mr-12" [(menuOpen)]="menuOpen" />

        <router-outlet />
      </div>
      <p class="px-8 py-8 text-center text-xs text-zinc-500">
        Copyright © {{ year }} Angular Primitives
      </p>
    </div>
  `,
})
export class AppComponent {
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
