import { signal } from '@angular/core';
import { deprecatedSetter } from 'ng-primitives/state';

describe('deprecatedSetter', () => {
  describe('with a WritableSignal (no custom setter)', () => {
    it('should proxy .set with a deprecation warning', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const s = signal(0);
      const proxy = deprecatedSetter(s, 'setValue');

      proxy.set(42);
      expect(s()).toBe(42);
      expect(warnSpy).toHaveBeenCalledWith(
        'Deprecation warning: Use setValue() instead of setting the value directly.',
      );
      warnSpy.mockRestore();
    });

    it('should proxy .update with a deprecation warning', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const s = signal(10);
      const proxy = deprecatedSetter(s, 'setValue');

      proxy.update(v => v + 5);
      expect(s()).toBe(15);
      expect(warnSpy).toHaveBeenCalledWith(
        'Deprecation warning: Use setValue() instead of setting the value directly.',
      );
      warnSpy.mockRestore();
    });

    it('should read the value via the proxy', () => {
      const s = signal('hello');
      const proxy = deprecatedSetter(s, 'setValue');
      expect(proxy()).toBe('hello');
    });
  });

  describe('with a read-only Signal and custom setter', () => {
    it('should proxy .set using the custom setter', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const s = signal(0);
      const setter = jest.fn((v: number) => s.set(v));
      const proxy = deprecatedSetter(s.asReadonly(), 'setValue', setter);

      proxy.set(42);
      expect(setter).toHaveBeenCalledWith(42);
      expect(s()).toBe(42);
      warnSpy.mockRestore();
    });

    it('should proxy .update using the custom setter with current value', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const s = signal(10);
      const setter = jest.fn((v: number) => s.set(v));
      const proxy = deprecatedSetter(s.asReadonly(), 'setValue', setter);

      proxy.update(v => v + 5);
      expect(setter).toHaveBeenCalledWith(15);
      expect(s()).toBe(15);
      expect(warnSpy).toHaveBeenCalledWith(
        'Deprecation warning: Use setValue() instead of setting the value directly.',
      );
      warnSpy.mockRestore();
    });

    it('should not throw when .update is called on a read-only signal proxy', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const s = signal('a');
      const setter = jest.fn((v: string) => s.set(v));
      const proxy = deprecatedSetter(s.asReadonly(), 'setValue', setter);

      expect(() => proxy.update(v => v + 'b')).not.toThrow();
      expect(s()).toBe('ab');
      warnSpy.mockRestore();
    });

    it('should read the value via the proxy', () => {
      const s = signal('hello');
      const proxy = deprecatedSetter(s.asReadonly(), 'setValue', jest.fn());
      expect(proxy()).toBe('hello');
    });
  });
});
