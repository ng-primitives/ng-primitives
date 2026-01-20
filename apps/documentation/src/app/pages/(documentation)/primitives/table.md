---
name: 'Table'
sourceUrl: 'https://github.com/ng-primitives/ng-primitives/tree/next/packages/ng-primitives/table'
---

# Table

While tables are a very common UI element, we currently do not provide a dedicated table primitive in Angular Primitives.

The main reason is that building a flexible, accessible, and fully-featured table component is a large and complex undertaking. There is already an excellent, battle-tested solution available: [TanStack Table](https://tanstack.com/table/latest/docs/framework/angular/).

TanStack Table is a headless table library that works very well alongside Angular Primitives. It provides all the core functionality you need for rendering tables (sorting, filtering, pagination, virtualization, etc.) without forcing a specific UI style, making it a perfect complement to our approach, and you can use it in conjunction with any of our UI primitives such as pagination etc.

## Why we don't provide a table primitive

**Complexity**: A table primitive is a large, feature-rich component that requires significant ongoing maintenance.

**No clear advantage**: TanStack Table already provides a highly capable solution. At the moment, we don't see how we could offer a better alternative.

**Focus on other primitives**: Our time and efforts are better spent providing primitives that don't already have great solutions elsewhere.

We may revisit this decision in the future, but for now, we recommend using TanStack Table alongside Angular Primitives for any table needs.
