import { computed, Directive } from '@angular/core';
import { ngpDrawerProvider, provideDrawerProviderState } from '../internal/provider-state';

@Directive({
  selector: 'ng-container[ngpDrawerProvider]',
  standalone: true,
  providers: [provideDrawerProviderState({ inherit: false })],
  exportAs: 'ngpDrawerProvider',
})
export class NgpDrawerProvider {
  private readonly state = ngpDrawerProvider();

  readonly anyOpen = computed(() => this.state.anyOpen());
  readonly openCount = computed(() => this.state.openCount());
}
