---
name: Get Started
order: 2
---

# Get Started

## Installation

Angular Primitives is distributed as a single package with entrypoints for each primitive.
This makes it easy to install and update, while keeping the bundle size as small as possible.

<tab-group>
  <tab-item label="Angular CLI">
    To install Angular Primitives using the Angular CLI, run the following command:

```bash npm
ng add ng-primitives
```

This command will install Angular Primitives and add the necessary dependencies to your project.

  </tab-item>

  <tab-item label="Nx">
    To install Angular Primitives using Nx, run the following command:

```bash npm
nx add ng-primitives
```

This command will install Angular Primitives and add the necessary dependencies to your project.

  </tab-item>

  <tab-item label="Manual Installation">
    
To manually install Angular Primitives, run the following command:

```bash npm
npm i ng-primitives
```

## Peer Dependencies

Angular Primitives relies on a few peer dependencies that need to be installed. If you are using NPM version 7 or higher, these dependencies will be installed automatically. If you are using an older version of NPM, or a different package manager, you may need to install them manually.

| Package          | Version  |
| ---------------- | -------- |
| @angular/cdk     | >=18.0.0 |
| @floating-ui/dom | >=1.6.0  |

To install these dependencies, run the following command:

```bash
npm i @angular/cdk@^18.0.0 @floating-ui/dom@^1.6.0
```

  </tab-item>
</tab-group>

## Usage

Once Angular Primitives is installed, you can start using the primitives in your Angular application.
It is best to create a reuable component that encapsulates the primitives, so that you can easily reuse it throughout your application.

Our primitives can be used both within a template or as a host directive on a component giving you the flexibility to choose the best approach for your use case.

Our primitives add `data-` attributes to the elements they are applied to based on their current state. This allows you to easily style the primitives using CSS without having to rely on JavaScript.
