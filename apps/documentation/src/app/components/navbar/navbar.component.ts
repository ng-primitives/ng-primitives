import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMoon, lucideSearch } from '@ng-icons/lucide';

@Component({
  selector: 'docs-navbar',
  standalone: true,
  imports: [NgIcon, RouterLink],
  viewProviders: [provideIcons({ lucideMoon, lucideSearch })],
  templateUrl: './navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {}
