import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, RendererFactory2, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

const LOCALSTORAGE_THEME_KEY = 'ng-primitives-theme';
const ThemeOptions = ['light', 'dark'] as const;
export type ThemeOption = (typeof ThemeOptions)[number];

@Injectable({
  providedIn: 'root',
})
export class ThemeTogglerService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);
  private readonly document = inject(DOCUMENT);

  private readonly theme = signal<'light' | 'dark' | 'system'>('system');
  readonly theme$ = toObservable(this.theme);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.theme.set((localStorage.getItem(LOCALSTORAGE_THEME_KEY) as ThemeOption) ?? 'system');
    }

    this.theme$.pipe(takeUntilDestroyed()).subscribe(theme => {
      // if we are on the server do nothing
      if (isPlatformServer(this.platformId)) {
        return;
      }

      // remove the classes from the documentElement
      this.document.documentElement.classList.remove('dark');

      // if the theme is system, we need to check the system theme
      if (theme === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          theme = 'dark';
        } else {
          theme = 'light';
        }
      }

      // set the class on the document
      if (theme === 'dark') {
        this.renderer.addClass(this.document.documentElement, theme);
      }
    });
  }

  setDarkMode(newMode: ThemeOption): void {
    localStorage.setItem(LOCALSTORAGE_THEME_KEY, newMode);
    this.theme.set(newMode);
  }
}
