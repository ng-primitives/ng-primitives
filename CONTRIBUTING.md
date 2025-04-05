# Contributing

We welcome contributions from the community! Whether you're a seasoned developer or just getting started, there are many ways to get involved. Here are a few ideas to get you started:

- **Report a bug**: If you find a bug in the library, please open an issue on GitHub. Be sure to include a detailed description of the bug, steps to reproduce, and any relevant code snippets.
- **Request a feature**: If you have an idea for a new feature or enhancement, please open an issue on GitHub. Be sure to include a detailed description of the feature, use cases, and any relevant code snippets.
- **Submit a pull request**: If you'd like to contribute code to the library, please open a pull request on GitHub. Be sure to include a detailed description of the changes, any relevant issue numbers, and any relevant code snippets.
- **Improve the documentation**: Documentation is a critical part of any library. If you'd like to help improve the library's documentation, please open a pull request on GitHub.
- **Spread the word**: If you enjoy using the library, please consider sharing it with others. The more people who use the library, the more feedback we'll receive, and the better the library will become.

## Requesting a new feature

While we draw inspiration from the libraries like Radix UI, Headless UI and React Aria we are not looking to port their features as-is.
We want to develop a feature in whatever way is best for Angular.

If you wish to develop a feature, please raise an issue or discussion first to discuss the feature and how it fits into the library.
We don't want you to spend time developing a feature that we may not be able to accept.

## Submitting a pull request

Before submitting a pull request, please make sure the following steps are completed:

1. Fork the repository and create a new branch from `main`.
2. Make your changes and ensure the tests pass.
3. Update the documentation if necessary.
4. Submit a pull request with a detailed description of the changes.

## Commit message guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification for commit messages. This allows us to automatically generate a changelog and version the library.

Here are a few examples of valid commit messages:

- `feat(accordion): add new accordion component`
- `fix(select): resolve issue with select panel z-index`
- `docs(accordion): adding documentation for accordion data attributes`

## Setting up the development environment

To set up the development environment, follow these steps:

1. Clone the repository: `git clone https://github.com/ng-primitives/ng-primitives.git`
2. Install the dependencies: `pnpm install`
3. Start the documentation server: `pnpm start`

## Adding a new feature

Angular Primitives is built with Nx which comes with support for generators. We have created several generators to help you quickly scaffold new features.

The following generators are available:

- `nx g @ng-primitives/tools:primitive <name>`: Generates a new secondary entry point for the library.
- `nx g @ng-primitives/tools:directive <name> --primitive <primitive>`: Generates a new directive in the library.
- `nx g @ng-primitives/tools:documentation <name> --description <description> --primitive <primitive>`: Generates a new documentation page for a primitive.
- `nx g @ng-primitives/tools:example <name> --primitive <primitive>`: Generates a new example for a primitive.
- `nx g @ng-primitives/tools:reusable-component button`: Generates a new reusable component.

It is recommended to use the [Nx Console](https://nx.dev/getting-started/editor-setup) to run these generators as it provides a user-friendly interface right in your IDE.

## Running the linting

To run the linting, use the following command:

```bash
pnpm lint
```

## Running the tests

To run the tests, use the following command:

```bash
pnpm test
```

## Building the library

To build the library and documentation, use the following command:

```bash
pnpm build
```

## Running the documentation

To run the documentation locally, use the following command:

```bash
pnpm start
```

## Creating reusable components

We provide example reusable components for consumers to easily build their own components using out primitives.

We can generate the boilerplate by running:

```bash
nx g @ng-primitives/tools:reusable-component button
```

That will create all the files you need, they will be under `apps/components/src/app/button`.

A preview site is availble to build and test these components which can be run using the following command:

```bash
nx serve components
```

This can be added as an example in the documentation site like so:

```html
<docs-snippet name="button"></docs-snippet>
```

## Troubleshoting

The documentation site is built using Analog, which may exhibit instability based on reports on Windows systems. For a smoother experience, we recommend running the site using Ubuntu inside WSL2 (Windows Subsystem for Linux). This should provide a more stable environment for running the documentation site.

For more details, please refer to the following issues and pull requests:

- https://github.com/analogjs/analog/issues/688
- https://github.com/analogjs/analog/pull/915

Thank you for your understanding and contributions!
