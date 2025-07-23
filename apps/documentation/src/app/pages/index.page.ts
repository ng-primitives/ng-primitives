import { isPlatformBrowser } from '@angular/common';
import { Component, HostListener, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroAdjustmentsHorizontal,
  heroBolt,
  heroCodeBracket,
  heroCubeTransparent,
  heroEye,
  heroMagnifyingGlass,
  heroSquares2x2,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'docs-navbar',
  imports: [NgIcon, RouterLink],
  template: `
    <nav
      class="group fixed z-20 h-16 w-full border-b border-transparent px-6 transition-all duration-500 data-[scrolled]:border-black/10 data-[scrolled]:bg-white data-[scrolled]:shadow-sm md:px-12"
      [attr.data-scrolled]="scrolled() ? '' : undefined"
    >
      <div
        class="from-primary to-accent absolute inset-x-0 top-0 hidden h-0.5 bg-gradient-to-r group-data-[scrolled]:block"
      ></div>
      <div
        class="container mx-auto flex h-full max-w-screen-xl items-center justify-between gap-x-2"
      >
        <img
          class="hidden h-8 transition-all duration-500 group-data-[scrolled]:invert-[1] md:block"
          src="/assets/logo-light.svg"
          alt="Logo"
        />

        <img
          class="h-8 transition-all duration-500 group-data-[scrolled]:invert-[1] md:hidden"
          src="/assets/logo-light-small.svg"
          alt="Logo"
        />
        <div class="flex items-center gap-x-0.5 md:gap-x-2">
          <div class="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
            <div id="docsearch-landing">
              <ng-icon name="heroMagnifyingGlass" />
              <span class="inline-flex">Search...</span>
            </div>
          </div>

          <a
            class="inline-flex h-10 items-center justify-center rounded-md px-4 text-[13px] font-medium text-white transition-colors hover:bg-white/10 active:bg-white/15 group-data-[scrolled]:text-black group-data-[scrolled]:hover:bg-black/5 group-data-[scrolled]:active:bg-black/10"
            routerLink="/getting-started/introduction"
            aria-label="Documentation"
          >
            Documentation
          </a>
          <a
            class="inline-flex h-10 items-center justify-center rounded-md px-4 text-[13px] font-medium text-white transition-colors hover:bg-white/10 active:bg-white/15 group-data-[scrolled]:text-black group-data-[scrolled]:hover:bg-black/5 group-data-[scrolled]:active:bg-black/10"
            href="https://discord.gg/NTdjc5r3gC"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Discord"
          >
            Discord
          </a>
          <a
            class="inline-flex h-10 items-center justify-center rounded-md px-4 text-[13px] font-medium text-white transition-colors hover:bg-white/10 active:bg-white/15 group-data-[scrolled]:text-black group-data-[scrolled]:hover:bg-black/5 group-data-[scrolled]:active:bg-black/10"
            target="_blank"
            href="https://github.com/ng-primitives/ng-primitives"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  `,
})
export class DocsNavbar implements OnInit {
  private readonly platform = inject(PLATFORM_ID);
  protected readonly scrolled = signal(false);

  async ngOnInit() {
    if (isPlatformBrowser(this.platform)) {
      const { default: docsearch } = await import('@docsearch/js');

      docsearch({
        appId: 'HTXZ7INLYZ',
        apiKey: 'ca9b161cfa378ce0410efcfd7cbedb47',
        indexName: 'angularprimitives',
        container: '#docsearch-landing',
      });

      this.scrolled.set(window.scrollY > 50);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const scrollTop = (event.target as Document).documentElement.scrollTop;
    this.scrolled.set(scrollTop > 50);
  }
}

@Component({
  selector: 'docs-index',
  imports: [NgIcon, RouterLink, DocsNavbar],
  providers: [
    provideIcons({
      heroMagnifyingGlass,
      heroCodeBracket,
      heroEye,
      heroCubeTransparent,
      heroBolt,
      heroAdjustmentsHorizontal,
      heroSquares2x2,
    }),
  ],
  template: `
    <docs-navbar />

    <section class="hero-section relative px-12 pb-20 pt-24">
      <div
        class="container relative z-10 mx-auto grid max-w-screen-xl items-center gap-8 lg:grid-cols-12"
      >
        <div class="text-center lg:col-span-7 lg:text-left">
          <h1
            class="font-jakarta mb-6 text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl"
          >
            Headless UI
            <br />
            Perfected for Angular
          </h1>
          <p class="mx-auto mb-6 max-w-md text-base text-white/80 sm:text-lg lg:mx-0">
            A comprehensive suite of unstyled, accessible primitives expertly crafted for Angular,
            enabling you to build design systems faster than ever before.
          </p>

          <div class="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4 lg:justify-start">
            <a
              class="inline-flex h-10 items-center justify-center rounded-full bg-white px-4 font-medium text-black ring-1 ring-black/10 transition hover:bg-white/90"
              routerLink="/getting-started/introduction"
            >
              Get Started
            </a>
            <a
              class="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 font-medium text-white ring-1 ring-black/10 transition hover:bg-black/90"
              href="https://discord.gg/NTdjc5r3gC"
              target="_blank"
            >
              Join the Community
            </a>
          </div>
        </div>

        <div class="hidden justify-end lg:col-span-5 lg:flex">
          <img class="w-full max-w-sm" src="/assets/hero.svg" alt="Hero Image" />
        </div>
      </div>

      <div class="container mx-auto flex max-w-screen-xl justify-center px-12 pt-12">
        <div class="flex flex-col gap-y-10">
          <h3 class="text-center text-sm font-medium text-white/70">Trusted by teams worldwide</h3>

          <div class="flex flex-wrap justify-center gap-x-10 gap-y-4 opacity-50">
            <img class="h-8" src="/assets/company-logos/coralogix.svg" alt="Coralogix Logo" />
            <img
              class="h-8 brightness-0 invert"
              src="/assets/company-logos/sidebar.svg"
              alt="Sidebar Logo"
            />
            <img
              class="h-8 brightness-[5] invert-0 saturate-0"
              src="/assets/company-logos/flowbite.svg"
              alt="Flowbite Logo"
            />
            <img class="h-8" src="/assets/company-logos/angular-ui.svg" alt="AngularUI Logo" />
          </div>
        </div>
      </div>
    </section>

    <section class="container mx-auto flex min-h-[332px] items-center px-8 pt-16">
      <div class="flex w-full flex-col gap-y-4">
        <p
          class="bg-gradient-to-r from-[#E90364] to-[#FA2C05] bg-clip-text text-sm font-medium text-transparent"
        >
          About
        </p>
        <h2 class="font-jakarta mb-4 text-[40px] font-semibold leading-tight">
          Designed for Flexibility. Built for Angular.
        </h2>
        <p class="w-full text-pretty text-base leading-relaxed text-zinc-500 lg:w-1/2">
          Angular Primitives helps you move faster by replacing traditional component libraries with
          a collection of low-level, accessible building blocks. No more fighting against
          opinionated styles or complex overrides! Style and compose your UI exactly how you want
          it, while still getting all the benefits of a fully accessible, performant, and
          future-proof foundation.
        </p>
      </div>
    </section>

    <section class="container mx-auto pb-20">
      <div class="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3">
        @for (feature of features; track feature) {
          <div class="-m-[0.5px] flex flex-col items-center gap-y-3 p-10">
            <div
              class="inline-flex size-12 items-center justify-center rounded-[10px] shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
            >
              <ng-icon class="text-2xl text-[#FA2C05]" [name]="feature.icon" />
            </div>
            <h3 class="font-jakarta text-center text-base font-semibold">
              {{ feature.title }}
            </h3>
            <p class="text-center text-sm text-zinc-500">
              {{ feature.description }}
            </p>
          </div>
        }
      </div>
    </section>

    <div class="bg-zinc-50 dark:bg-zinc-800">
      <section class="container mx-auto flex min-h-[332px] items-center px-8 py-8">
        <div class="flex w-full flex-col items-center gap-y-4">
          <p
            class="bg-gradient-to-r from-[#E90364] to-[#FA2C05] bg-clip-text text-sm font-medium text-transparent"
          >
            Get Started
          </p>
          <h2 class="font-jakarta mb-4 text-center text-[40px] font-semibold leading-tight">
            Try it out
          </h2>
          <p
            class="mb-4 w-full text-pretty text-center text-base leading-relaxed text-zinc-500 lg:w-1/2"
          >
            Get started with Angular Primitives with just a single command. We provide Angular
            schematics to help you quickly add primitives to your project.
          </p>

          <div class="w-full max-w-sm overflow-hidden rounded-lg bg-zinc-950 text-white/90">
            <div class="mt-0 flex flex-1 flex-col outline-none">
              <div class="flex h-8 items-center border-b border-b-zinc-800 px-4">
                <div class="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                <div class="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                <div class="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <pre
                class="px-4 py-3.5"
              ><code class="relative font-mono text-sm leading-none text-center">ng add ng-primitives</code></pre>
            </div>
          </div>
        </div>
      </section>
    </div>

    <section class="container mx-auto flex min-h-[332px] items-center px-8 pt-8">
      <div class="flex w-full flex-col gap-y-4">
        <p
          class="bg-gradient-to-r from-[#E90364] to-[#FA2C05] bg-clip-text text-sm font-medium text-transparent"
        >
          Testimonials
        </p>
        <h2 class="font-jakarta mb-4 text-[40px] font-semibold leading-tight">
          Loved by Angular Developers
        </h2>
        <p class="w-full text-pretty text-base leading-relaxed text-zinc-500 lg:w-1/2">
          From solo developers to enterprise teams, Angular Primitives is accelerating UI
          development and empowering teams to build with confidence.
        </p>
      </div>
    </section>

    <section class="container mx-auto px-8 pb-20 pt-8">
      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        @for (testimonial of testimonials; track testimonial) {
          <div
            class="flex flex-col justify-between rounded-xl bg-zinc-50 p-8 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700"
          >
            <p class="mb-6 text-sm leading-loose text-zinc-600 dark:text-zinc-400">
              “{{ testimonial.quote }}”
            </p>
            <div class="flex items-center gap-4 pt-4">
              <img
                class="h-12 w-12 rounded-full object-cover"
                [src]="testimonial.image"
                [alt]="testimonial.name + ' photo'"
              />
              <div>
                <div class="font-semibold">{{ testimonial.name }}</div>
                <div class="text-sm opacity-50">{{ testimonial.role }}</div>
              </div>
            </div>
          </div>
        }
      </div>
    </section>

    <footer class="bg-zinc-50 dark:bg-zinc-800">
      <div
        class="container mx-auto flex flex-col items-center justify-between gap-y-4 px-10 py-6 md:flex-row"
      >
        <span class="text-[13px] opacity-50">
          © {{ year }} Angular Primitives. All rights reserved.
        </span>
        <div class="flex gap-x-4">
          <a
            class="inline-flex h-10 items-center justify-center rounded-md px-4 text-[13px] font-medium opacity-50 transition-colors hover:bg-zinc-900/10 dark:hover:bg-zinc-100/10"
            target="_blank"
            href="https://github.com/sponsors/ng-primitives"
          >
            Sponsor Us
          </a>
          <a
            class="inline-flex h-10 items-center justify-center rounded-md px-4 text-[13px] font-medium opacity-50 transition-colors hover:bg-zinc-900/10 dark:hover:bg-zinc-100/10"
            target="_blank"
            href="https://discord.gg/NTdjc5r3gC"
          >
            Discord
          </a>
          <a
            class="inline-flex h-10 items-center justify-center rounded-md px-4 text-[13px] font-medium opacity-50 transition-colors hover:bg-zinc-900/10 dark:hover:bg-zinc-100/10"
            target="_blank"
            href="https://github.com/ng-primitives/ng-primitives"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  `,
  styles: `
    .hero-section {
      background: linear-gradient(
        90deg,
        #d92c22 0%,
        #d0261e 30.77%,
        #d2271f 62.98%,
        #e7372a 99.52%
      );
    }

    .hero-section::before {
      content: '';
      position: absolute;
      width: 404px;
      height: 404px;
      left: -50px;
      top: -92px;
      background: rgba(241, 139, 132, 0.45);
      filter: blur(100px);
    }
  `,
})
export default class IndexPage {
  readonly year = new Date().getFullYear();
  readonly features = [
    {
      icon: 'heroCodeBracket',
      title: 'Headless by Design',
      description:
        'Build exactly what you need with completely unstyled components. Angular Primitives gives you full control over markup and styling — no overrides, no bloat.',
    },
    {
      icon: 'heroEye',
      title: 'Accessible Out of the Box',
      description:
        'Every primitive is built to meet accessibility standards, including keyboard navigation and ARIA roles, so your UI is usable by everyone.',
    },
    {
      icon: 'heroCubeTransparent',
      title: 'Composable and Lightweight',
      description:
        'Designed with composition in mind, primitives integrate cleanly into your components and keep your bundle lean and maintainable.',
    },
    {
      icon: 'heroBolt',
      title: 'Powered by Angular Signals',
      description:
        "Leverages Angular's latest reactivity model for blazing-fast updates and a more predictable developer experience.",
    },
    {
      icon: 'heroAdjustmentsHorizontal',
      title: 'Future Proofed',
      description:
        'Built specifically for the latest Angular versions, ensuring compatibility with the latest features and best practices including Zoneless support.',
    },
    {
      icon: 'heroSquares2x2',
      title: 'Perfect for Design Systems',
      description:
        'The ideal foundation for scalable design systems. We provide the behavior and interactions, you bring the design.',
    },
  ];

  readonly testimonials = [
    {
      name: 'Ayush Seth',
      role: 'Sidebar by SpotDraft',
      quote:
        'Moving from React to Angular, I struggled to find solid headless UI libraries like Radix or Headless UI. Angular Primitives was a breath of fresh air—modern, actively maintained, and a joy to use. Ashley and the other contributors are doing amazing work.',
      image: '/assets/testimonials/ayushseth.webp',
    },
    {
      name: 'Ruud Walraven',
      role: 'Angular Developer',
      quote:
        'With other frameworks, I always had to check how well we could match the design without hacks, often leading to compromises with UX. With ng-primitives, I can confidently commit based on what I know I can do with HTML, CSS and TS. No more trade-offs between design and implementation.',
      image: '/assets/testimonials/ruudwalraven.webp',
    },
    {
      name: 'Edoh Kodjo',
      role: 'Angular Developer',
      quote:
        'With ng-primitive, developers own the experience and users own the look—no assumptions, just full control.',
      image: '/assets/testimonials/kedevked.jpg',
    },
  ];
}
