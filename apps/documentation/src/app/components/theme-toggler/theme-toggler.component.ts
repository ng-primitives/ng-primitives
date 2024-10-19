import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSun } from '@ng-icons/lucide';
import { NgpButton } from 'ng-primitives/button';
import { type ThemeOption, ThemeTogglerService } from './theme-toggler.service';

@Component({
  selector: 'docs-theme-toggler',
  standalone: true,
  viewProviders: [provideIcons({ lucideMoon, lucideSun })],
  templateUrl: './theme-toggler.component.html',
  imports: [AsyncPipe, NgIcon, NgpButton],
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class ThemeTogglerComponent {
  private themeService = inject(ThemeTogglerService);
  theme$ = this.themeService.theme$;

  setTheme(theme: ThemeOption) {
    this.themeService.setTheme(theme);
  }
}
