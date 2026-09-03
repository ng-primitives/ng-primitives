# Angular Native - implementation plan

Build Angular apps that render **real native iOS/Android views** on the React Native / Expo
foundation, with React never in the render path.

This document is a hand-off brief for an implementing agent. It is standalone and belongs in the
new `angular-native` repo - it lives here only because that repo does not exist yet.

---

## 1. Thesis

React Native's renderer is not React-coupled. Fabric exposes a JSI-bound mutation API on
`global.nativeFabricUIManager`; React's reconciler is one client of it. Angular can be another,
via `Renderer2`/`RendererFactory2`.

Everything below follows from that single seam. `react-native` stays an **unmodified dependency** -
nothing is forked, not RN, not Expo.

### Non-goals

- No webview rendering. No Capacitor, Lynx, or NativeScript.
- No fork of `react-native` or `expo`.
- No attempt to run third-party **React** components. Their bodies call hooks off a dispatcher that
  is null here, and two renderers cannot co-own one Fabric shadow tree. Third-party **native views**
  and **TurboModules** are reachable and are the reuse path.
- No SSR, no hydration, no DOM emulation layer.

---

## 2. Invariants

These are load-bearing. Violating any one of them invalidates the architecture.

1. **AOT only.** Release bundles are precompiled to Hermes bytecode and Hermes excludes local-mode
   `eval()`. Shipping `@angular/compiler` for JIT is both large and pointless.
2. **Zoneless only.** zone.js fights Hermes. `@angular/core >= 20` for the stable zoneless API;
   target v22.
3. **No `@angular/platform-browser`.** Bootstrap is `createEnvironmentInjector` + `createComponent`
   over `@angular/core` alone.
4. **The engine is framework-agnostic.** Angular-specific logic lives only in the adapter. This is
   what keeps a Vue/Solid adapter possible later and, more importantly, keeps the commit logic
   testable without Angular in the loop.
5. **One commit per change-detection pass.** `RendererFactory2.end()` fires once per
   `ApplicationRef.tick()` - that is the flush point.

---

## 3. Architecture

```
Angular component
      ↓  Renderer2 (mutating: createElement/appendChild/setProperty/listen)
@angular-native/adapter
      ↓  engine mutation API (createElement/appendChild/insertBefore/removeChild/setProp/setEventListener)
@angular-native/engine          retained tree + clone-on-write commit
      ↓  global.nativeFabricUIManager
stock Fabric C++ / JSI / Yoga / iOS + Android host views
```

The mismatch the engine exists to solve: **Angular mutates, Fabric is persistent.** You never mutate
a committed node - you clone it with new props/children and hand a fresh child set to
`completeRoot`. Cloning a leaf forces every ancestor to re-clone, because a persistent parent holds
references to specific child handles. That bubble is inherent, and is exactly what React's own
Fabric renderer does.

### Package layout

```
packages/
  engine/          retained tree, clone-on-write commit, event dispatch, style flattening
  adapter/         Renderer2 + RendererFactory2, bootstrap, DI providers
  components/      host primitives: View, Text, Pressable, ScrollView, TextInput, ...
  router/          NativeStackOutlet, NativePlatformLocation, NativeRouterLink
  metro/           Metro transformer + config preset (oxc-angular)
  expo-link/       autolinking glue for expo-modules-core packages
  test-utils/      fake nativeFabricUIManager for Node unit tests
examples/
  canary/          the reference app, exercised by e2e
```

---

## 4. Milestones

Each milestone has a **Done when** clause. Do not start the next one until it holds.

### M0 - Spike (de-risks everything)

Stock RN 0.87 / Expo SDK 57 app. No abstractions, single file if it helps.

- `AppRegistry.registerRunnable(appName, ({ rootTag }) => mount(rootTag, AppComponent))` -
  **`registerRunnable`, not `registerComponent`**: RN stores a raw mount callback and never renders
  it with its own renderer.
- ~300 line `Renderer2` maintaining a retained tree, committing via `createNode` /
  `cloneNodeWithNewChildrenAndProps` / `createChildSet` / `appendChildToSet` / `completeRoot`.
- Metro transformer calling `transformAngularFileSync` from `@oxc-angular/vite/api`.

**Done when:** a zoneless standalone component with a `signal` counter and one `Pressable` renders a
real native `RCTView` on both iOS and Android, and tapping increments it.

### M1 - Engine

- Retained tree node (`{ component, props, children, committed }`) where `committed` mirrors what
  Fabric currently holds: handle, flat props, child identities, resolved view name.
- **Incremental commit.** Walk the retained tree, clone only dirty nodes, reuse untouched sibling
  subtrees by reference. A full rebuild per commit wipes native view state - scroll offset, text
  cursor, keyboard focus - on every tick. Non-negotiable.
- Dirty marking split: props-dirty vs structure-dirty.
- Event dispatch: register handlers by node, route Fabric's `(instanceHandle, topLevelType,
  nativeEvent)` callback, honour the `unstable_*EventPriority` constants.
- Style flattening (arrays, nested arrays, nulls) and colour processing.
- Feature-detect `cloneNodeWithNewChildren`'s child-list parameter before using it. A host that
  ignores the argument commits a parent with **no children** - a blank screen, not an error.

**Done when:** `test-utils`' fake Fabric proves mount, prop update, insert, move, remove, and
"unchanged subtree is reused by reference", with commit counters asserting `created === 0` after
first mount.

### M2 - Angular adapter

`Renderer2` surface to implement: `createElement`, `createComment`, `createText`, `destroyNode`,
`appendChild`, `insertBefore`, `removeChild`, `selectRootElement`, `parentNode`, `nextSibling`,
`setAttribute`, `removeAttribute`, `addClass`, `removeClass`, `setStyle`, `removeStyle`,
`setProperty`, `setValue`, `listen`. Plus `RendererFactory2.createRenderer/begin/end`.

Bootstrap recipe (verified against a working implementation):

```ts
const injector = createEnvironmentInjector(
  [
    { provide: INJECTOR_SCOPE, useValue: 'root' },   // ɵINJECTOR_SCOPE
    provideZonelessChangeDetectionInternal(),         // ɵprovideZonelessChangeDetectionInternal
    { provide: RendererFactory2, useClass: NativeRendererFactory },
    { provide: DOCUMENT, useValue: documentStub },
    { provide: ErrorHandler, useClass: NativeErrorHandler },
  ],
  null as unknown as EnvironmentInjector,            // null parent === root injector
);
const ref = createComponent(AppComponent, { environmentInjector: injector, hostElement: host });
injector.get(ApplicationRef).attachView(ref.hostView);
```

Two sanctioned casts, confined to this file: the null injector parent, and the host. Angular's
`locateHostElement` reads `hostElement.tagName`, so define a `tagName` property on the host node.

Note the two private APIs (`ɵINJECTOR_SCOPE`, `ɵprovideZonelessChangeDetectionInternal`). Pin the
Angular version and add a smoke test that fails loudly on upgrade.

**Done when:** the M0 spike runs through the real adapter, plus `@if`, `@for`, `@switch`, `@defer`,
content projection, and a dynamic `ViewContainerRef` insert all render correctly.

### M3 - Toolchain

`@oxc-angular/vite/api` is a pure NAPI loader with no Vite import - it drops into Metro's
`babelTransformerPath`:

- `transformAngularFileSync(source, filename, options)` - per-file, no TypeScript program, so it
  works inside Metro's worker pool. This is what removes the `ngc --watch` sidecar.
- `linkAngularPackageSync(code, filename)` - every Angular library on npm ships partial-compiled
  (`ɵɵngDeclareComponent`), so the linker must be in the pipeline. Native, no babel.
- `TransformResult.dependencies` feeds Metro's watch invalidation.
- Type checking is **not** the bundler's job. `tsc --noEmit` as a separate CI gate, language service
  in the editor. Same split RN already uses with babel.

Per-file AOT is sound because Ivy matches directives at **runtime** from the component's
`dependencies` array - template compilation does not need cross-file resolution.

**Done when:** `expo start` gives a single-process dev loop with fast refresh, and a release build
produces Hermes bytecode with no `@angular/compiler` in the bundle (assert on bundle contents).

### M4 - Host primitives

Target set: `View`, `Text`, `Pressable`, `TouchableOpacity`, `ScrollView`, `FlatList`,
`VirtualizedList`, `SectionList`, `TextInput`, `Image`, `ImageBackground`, `Modal`, `Switch`,
`ActivityIndicator`, `SafeAreaView`, `KeyboardAvoidingView`, `RefreshControl`.

Two traps specific to Angular's renderer:

1. **Comment nodes.** Angular emits `createComment` anchors for `@if`/`@for`/`ViewContainerRef`.
   Fabric has no comment node. Model them as virtual anchors in the retained tree that never commit,
   while still participating in sibling ordering.
2. **Raw text.** RN requires text to live inside a `Text`. Angular templates produce text nodes
   anywhere. Wrap raw text in a virtual text component and drop empty text nodes.

**Done when:** the canary app renders every primitive, and a list of 1000 rows scrolls without
dropped frames on a release build.

### M5 - Forms and styling

- `ControlValueAccessor` implementations for `TextInput`, `Switch`, and any other value primitives.
  Reactive forms and `ngModel` then work unchanged.
- Styling: no cascade. `styles:` blocks go through a CSS-to-RN-style Metro transformer; anything it
  cannot express is a build error, not a silent no-op.
- `HttpClient` works on RN's `fetch`/`XMLHttpRequest`; `XhrFactory` is the seam if native networking
  is wanted later.

**Done when:** a reactive form with validation, and a template-driven form with `ngModel`, both
round-trip on device.

### M6 - Router

All three seams are public Angular API.

- **`NativeStackOutlet implements RouterOutletContract`** - `activateWith`, `deactivate`, `attach`,
  `detach`. `detach()` returns the live `ComponentRef`, so a pushed-away screen keeps its state and
  popping re-attaches it.
- **`NativePlatformLocation extends PlatformLocation`** - `pushState`, `replaceState`, `back`,
  `forward`, `historyGo`, `onPopState`, `getState`, `pathname`, `search`, `hash`. The URL tree stays
  the source of truth in both directions: `router.navigate()` pushes a native screen, and swipe-back
  or Android hardware back arrive through `onPopState` so Angular never desyncs.
- **`NativeRouterLink`** - replaces `RouterLink` (which host-binds `href` and DOM click) on top of
  `Pressable`.

The native half already exists: `react-native-screens` ships `RNSScreenStack`, `RNSScreen`,
`RNSScreenStackHeaderConfig` and `RNSSearchBar` as codegen'd Fabric components. Register their
**ViewConfigs** and drive them with `createNode` - never their React components. `react-navigation`
is unreachable (hooks) and is not a dependency.

Guards, resolvers, `loadComponent`, `withComponentInputBinding`, and `UrlSerializer` carry over
unchanged. Note `loadComponent` is bundle organisation on native, not network chunks. Deep links
come from `expo-linking`.

**Done when:** push/pop/replace/reset, native header, swipe-back gesture, Android hardware back, and
a deep link into a nested route all keep `Router.url` correct.

### M7 - Expo integration

Keep Expo's **native** SDK; replace only the JS above it.

- `requireNativeModule('ExpoHaptics')` and friends work directly - `expo-modules-core`'s core
  (`NativeModule`, `EventEmitter`, `SharedObject`, `requireNativeModule`) has no React dependency.
- What breaks is autolinking: without the `expo` aggregator there is no generated
  `implementation project(':expo-<pkg>')` line and no `ModulesProvider` entry, so a missing module
  compiles cleanly and fails at **runtime** with `Cannot find native module '<Name>'`. Ship
  `expo-link`: a `native-link.json` manifest per wrapper package plus a `postinstall` aggregator.
- Rewrite required: `expo-router`, every view-bearing Expo component (`CameraView`, `VideoView`,
  `expo-image`), and `'use dom'`.
- EAS Build/Update/Submit, `expo prebuild`, config plugins and expo-dev-client all work as-is.

**Done when:** the canary ships through EAS Build to a device, using at least three Expo native
modules.

### M8 - Animation

The deep one, deliberately last.

- Reimplement `Animated` including the native driver: `Value`, `ValueXY`, `timing`/`spring`/`decay`,
  `interpolate`, `Easing`, `Animated.event`, and the animated-node graph.
- Reanimated worklets are the known large gap. Scope explicitly; do not half-ship it.

**Done when:** a 60fps native-driver transition runs on a release build with the JS thread blocked.

---

## 5. Testing

- **Unit:** fake `nativeFabricUIManager` in `test-utils` + Angular `TestBed` with the native
  `RendererFactory2`. Real component trees, real commits, in Node. No simulator. This is the
  workhorse - most of the engine and adapter is testable this way.
- **Parity:** golden tests asserting the committed tree for a given template, so refactors to the
  commit logic cannot silently change output.
- **E2E:** Detox on both platforms against the canary.
- Angular DevTools needs the DOM and will not work. Debugging is Hermes/Chrome DevTools for JS plus
  the native view hierarchy inspectors.

---

## 6. Hazards

Collected so they are not rediscovered one at a time:

- A full rebuild per commit wipes scroll position and text cursor. Incremental commit is a
  correctness requirement, not an optimisation.
- `cloneNodeWithNewChildren`'s child-list parameter must be feature-detected (see M1).
- `nativeFabricUIManager` is a lazy caching proxy - every property access mints a fresh host
  function. Read each method once into a plain facade.
- Comment-node anchors and raw text (see M4) break in ways that look like layout bugs.
- Private Angular APIs in bootstrap will break on major upgrades. Smoke-test them.
- Metro transformers run in a worker pool: no shared mutable state, no long-lived program.
- Partial-compiled npm packages need the linker or they fail at runtime, not build time.
- Third-party React components fail with a null hook dispatcher. Reach for the native view +
  ViewConfig instead.

---

## 7. Prior art worth reading before starting

- **`OneEyed1366/symbiote-native`** - the same architecture, already working across five frameworks
  including Angular. Its `core/engine` (clone-on-write commit) and `adapters/angular` are the
  closest thing to a reference implementation; `packages/navigation` already drives
  `react-native-screens` from Angular, and `packages/expo-modules-link` solves the autolinking glue.
  Read it before writing the engine.
- **`voidzero-dev/oxc-angular-compiler`** - the Rust Angular compiler behind M3.
- React Native's `Libraries/ReactNative/FabricUIManager.js` - the authoritative list of what the
  Fabric JS API actually offers.

---

## 8. Suggested order

M0 → M1 → M2 → M3 → M4 → M6 → M5 → M7 → M8.

Router before forms: navigation shapes the app structure and surfaces engine bugs (detach/attach,
view reuse) far earlier than form controls do.
