import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, RendererFactory2, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

const LOCALSTORAGE_THEME_KEY = 'ng-primitives-theme';
const ThemeOptions = ['light', 'dark'] as const;
export type ThemeOption = (typeof ThemeOptions)[number];

@Injectable({
  providedIn: 'root',
})
export class ThemeTogglerService {
  private platformId = inject(PLATFORM_ID);
  private renderer = inject(RendererFactory2).createRenderer(null, null);
  private document = inject(DOCUMENT);

  private theme = signal<'light' | 'dark' | 'system'>('system');
  theme$ = toObservable(this.theme);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.theme.set((localStorage.getItem(LOCALSTORAGE_THEME_KEY) as ThemeOption) ?? 'system');
    }

    this.theme$.pipe(takeUntilDestroyed()).subscribe(theme => {
      // if the theme is system, resolve it to the system theme
      if (theme === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        this.setTheme(theme);
        return;
      }

      if (theme === 'dark') {
        this.renderer.addClass(this.document.documentElement, 'dark');
      } else {
        if (this.document.documentElement.className.includes('dark')) {
          this.renderer.removeClass(this.document.documentElement, 'dark');
        }
      }
    });
  }

  setTheme(theme: ThemeOption): void {
    localStorage.setItem(LOCALSTORAGE_THEME_KEY, theme);
    this.theme.set(theme);
  }
}
