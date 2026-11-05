import { Directive, OnDestroy } from '@angular/core';
import { ngpAutocompletePortal, provideAutocompletePortalState } from './autocomplete-portal-state';

@Directive({
  selector: '[ngpAutocompletePortal]',
  exportAs: 'ngpAutocompletePortal',
  providers: [provideAutocompletePortalState()],
})
export class NgpAutocompletePortal implements OnDestroy {
  protected readonly state = ngpAutocompletePortal({});

  ngOnDestroy(): void {
    this.state.destroy();
  }
}
