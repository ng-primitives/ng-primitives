import { Directive, computed } from '@angular/core';
import { injectSelectState } from '../select/select-state';

@Directive({
  selector: '[ngpSelectViewValue]',
  exportAs: 'ngpSelectViewValue',
  host: {
    '[textContent]': 'displayText()',
  },
})
export class NgpSelectViewValue {
  private readonly state = injectSelectState();

  readonly displayText = computed(() => this.state().triggerText());
}
