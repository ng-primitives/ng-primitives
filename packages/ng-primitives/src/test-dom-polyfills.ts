function installDomPolyfills(): void {
  Element.prototype.getAnimations = () => [];

  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  globalThis.ResizeObserver = class {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    observe(): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    unobserve(): void {}
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    disconnect(): void {}
  };
}

function installScrollIntoViewPolyfill(fnFactory: () => () => void): void {
  installDomPolyfills();
  Element.prototype.scrollIntoView = fnFactory();
}

export function installJestDomPolyfills(fnFactory: () => () => void): void {
  installScrollIntoViewPolyfill(fnFactory);
}

export function installVitestDomPolyfills(fnFactory: () => () => void): void {
  installScrollIntoViewPolyfill(fnFactory);
}
