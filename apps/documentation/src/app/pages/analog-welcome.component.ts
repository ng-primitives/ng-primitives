import { Component } from '@angular/core';

@Component({
  selector: 'documentation-analog-welcome',
  standalone: true,
  host: {
    class: 'flex min-h-screen flex-col text-zinc-900 bg-zinc-50 px-4 pt-8 pb-32',
  },
  template: `
    <main class="mx-auto flex-1">
      <section class="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div class="flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <img
            class="h-12 w-12"
            src="https://analogjs.org/img/logos/analog-logo.svg"
            alt="AnalogJs logo. Two red triangles and a white analog wave in front"
          />
          <a
            class="focus-visible:ring-ring rounded-2xl bg-zinc-200 px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            target="_blank"
            href="https://twitter.com/analogjs"
          >
            Follow along on Twitter
          </a>
          <h1 class="font-heading text-3xl font-medium sm:text-5xl md:text-6xl lg:text-7xl">
            <span class="text-[#DD0031]">Analog.</span>
            The fullstack Angular meta-framework
          </h1>
          <p class="text-muted-foreground max-w-[42rem] leading-normal sm:text-xl sm:leading-8">
            Analog is for building applications and websites with Angular.
            <br />
            Powered by Vite.
          </p>
          <div class="space-x-4">
            <a
              class="focus-visible:ring-ring ring-offset-background inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-8 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-950/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              href="https://analogjs.org"
            >
              Read the docs
            </a>
            <a
              class="focus-visible:ring-ring ring-offset-background border-input inline-flex h-11 items-center justify-center rounded-md border px-8 text-sm font-medium transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              target="_blank"
              rel="noreferrer"
              href="https://github.com/analogjs/analog"
            >
              Star on GitHub
            </a>
          </div>
        </div>
      </section>
      <section class="container py-8 md:py-12 lg:py-24" id="counter-demo">
        <div
          class="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center"
        >
          <h2 class="text-3xl font-medium leading-[1.1] text-[#DD0031]">Counter</h2>
          <p class="text-muted-foreground max-w-[85%] leading-normal sm:text-lg sm:leading-7">
            This is a simple interactive counter. Powered by Angular.
          </p>
          <button
            class="focus-visible:ring-ring ring-offset-background border-input inline-flex h-11 items-center justify-center rounded-md border px-8 text-sm font-medium transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            (click)="increment()"
          >
            Count:
            <span class="ml-1 font-mono">{{ count }}</span>
          </button>
        </div>
      </section>
    </main>
  `,
})
export class AnalogWelcomeComponent {
  public count = 0;
  public increment() {
    this.count++;
  }
}
