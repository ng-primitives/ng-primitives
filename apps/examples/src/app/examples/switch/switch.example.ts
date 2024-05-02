import { Component } from '@angular/core';
import { NgpSwitchDirective, NgpSwitchThumbDirective } from '@ng-primitives/ng-primitives/switch';

@Component({
  standalone: true,
  selector: 'app-switch',
  imports: [NgpSwitchDirective, NgpSwitchThumbDirective],
  template: `
    <div class="flex items-center gap-x-4">
      <label class="font-medium text-zinc-950" for="mobile-data">Mobile Data</label>
      <button
        class="relative h-6 w-10 rounded-full border border-zinc-300 bg-zinc-200 outline-none transition-colors focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-500 data-[state=checked]:border-zinc-950 data-[state=checked]:bg-zinc-950"
        id="mobile-data"
        ngpSwitch
      >
        <span
          class="block size-5 translate-x-[1px] rounded-full bg-white transition-transform data-[state=checked]:translate-x-[17px]"
          ngpSwitchThumb
        ></span>
      </button>
    </div>
  `,
})
export default class SwitchExample {}
