import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowUp, heroPlus } from '@ng-icons/heroicons/outline';
import { NgpAutoScroll } from 'ng-primitives/ai';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-ai',
  imports: [NgpAutoScroll, NgIcon, NgpButton],
  providers: [provideIcons({ heroArrowUp, heroPlus })],
  template: `
    <div class="h-[700px] w-full">
      <div class="dark flex h-full flex-col items-stretch rounded-2xl bg-white px-4">
        <div class="flex flex-grow flex-col gap-8 pt-16">
          <div class="flex flex-grow flex-col items-center justify-center">
            <p class="text-xl text-black">Hello there!</p>
            <p class="text-base text-black/50">How can I help you today?</p>
          </div>
        </div>

        <form
          class="mx-auto flex w-full max-w-screen-md items-end rounded-3xl bg-white/5 shadow-sm ring-1 ring-black/10"
        >
          <button
            class="m-2 flex size-8 items-center justify-center rounded-full transition-colors hover:bg-black/5"
            ngpButton
            type="button"
          >
            <ng-icon class="font-base text-black" name="heroPlus" />
          </button>

          <textarea
            class="h-12 max-h-40 flex-grow resize-none bg-transparent py-3.5 text-sm outline-none placeholder:text-black/50"
            #promptInput
            [value]="prompt()"
            (input)="prompt.set(promptInput.value)"
            name="input"
            placeholder="Message ChatNGP"
            style="height: 48px !important;"
          ></textarea>

          <button
            class="m-2 flex size-8 items-center justify-center rounded-full bg-black text-white transition-colors disabled:bg-black/5 disabled:text-black/15"
            [disabled]="!canSubmit()"
            ngpButton
            type="button"
          >
            <ng-icon class="font-base" name="heroArrowUp" />
          </button>
        </form>

        <p class="my-1 p-2 text-center text-xs text-black/50">
          ChatNGP can make mistakes. Check important info.
        </p>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export default class AiExample {
  readonly prompt = signal<string>('');

  readonly canSubmit = computed(() => this.prompt().trim().length > 0);
}
