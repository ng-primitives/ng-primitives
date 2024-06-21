import { Component, Injector, effect, inject, signal } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { saxMoonOutline } from '@ng-icons/iconsax/outline';
import { filter } from 'rxjs';
import { ExampleComponent } from './components/example/example.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ResponseFieldComponent } from './components/response-field/response-field.component';
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
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  readonly year = new Date().getFullYear();

  readonly menuOpen = signal(false);

  constructor() {
    // Register the custom element with the browser.
    customElements.define(
      'docs-example',
      createCustomElement(ExampleComponent, { injector: this.injector }),
    );

    customElements.define(
      'response-field',
      createCustomElement(ResponseFieldComponent, { injector: this.injector }),
    );

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.menuOpen.set(false));

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
