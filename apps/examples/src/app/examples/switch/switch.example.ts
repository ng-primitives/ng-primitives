import { Component } from '@angular/core';
import { NgpSwitchDirective, NgpSwitchThumbDirective } from '@ng-primitives/ng-primitives/switch';

@Component({
  standalone: true,
  selector: 'app-switch',
  imports: [NgpSwitchDirective, NgpSwitchThumbDirective],
  template: `<div class="flex items-center gap-x-4">
    <label class="text-primary-300" for="mobile-data"> Mobile Data </label>
    <button
      class="focus-visible:ring-primary-500 data-[state=checked]:bg-primary-500 bg-primary-300/10 relative h-6 w-10 rounded-full outline-none transition-colors focus-visible:ring-2"
      id="mobile-data"
      ngpSwitch
    >
      <span
        class="block size-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[18px]"
        ngpSwitchThumb
      ></span>
    </button>
  </div>`,
})
export default class SwitchExample {}
