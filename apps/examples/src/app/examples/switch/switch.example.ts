import { Component } from '@angular/core';
import { NgpSwitchDirective, NgpSwitchThumbDirective } from '@ng-primitives/ng-primitives/switch';

@Component({
  standalone: true,
  selector: 'app-switch',
  imports: [NgpSwitchDirective, NgpSwitchThumbDirective],
  template: `<div class="flex items-center gap-x-4">
    <label class="text-white" for="mobile-data"> Mobile Data </label>
    <button
      class="relative h-6 w-10 rounded-full bg-blue-300/10 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=checked]:bg-blue-500"
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
