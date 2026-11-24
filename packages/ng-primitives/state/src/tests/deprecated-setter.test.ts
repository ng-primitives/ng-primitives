import { computed, isWritableSignal, signal } from '@angular/core';
import { deprecatedSetter } from 'ng-primitives/state';
import { describe, expect, it, vi } from 'vitest';

describe('deprecatedSetter', () => {
  describe('with a WritableSignal (no custom setter)', () => {
    it('should proxy .set with a deprecation warning', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
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
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
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

    it('should return a read-only view of the source from .asReadonly', () => {
      const s = signal(1);
      const readonly = deprecatedSetter(s, 'setValue').asReadonly();

      s.set(2);
      expect(readonly()).toBe(2);
      expect(isWritableSignal(readonly)).toBe(false);
    });
  });

  describe('with a read-only Signal and custom setter', () => {
    it('should proxy .set using the custom setter', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const s = signal(0);
      const setter = vi.fn((v: number) => s.set(v));
      const proxy = deprecatedSetter(s.asReadonly(), 'setValue', setter);

      proxy.set(42);
      expect(setter).toHaveBeenCalledWith(42);
      expect(s()).toBe(42);
      warnSpy.mockRestore();
    });

    it('should proxy .update using the custom setter with current value', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const s = signal(10);
      const setter = vi.fn((v: number) => s.set(v));
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
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const s = signal('a');
      const setter = vi.fn((v: string) => s.set(v));
      const proxy = deprecatedSetter(s.asReadonly(), 'setValue', setter);

      expect(() => proxy.update(v => v + 'b')).not.toThrow();
      expect(s()).toBe('ab');
      warnSpy.mockRestore();
    });

    it('should read the value via the proxy', () => {
      const s = signal('hello');
      const proxy = deprecatedSetter(s.asReadonly(), 'setValue', vi.fn());
      expect(proxy()).toBe('hello');
    });

    it('should return a read-only view of a computed source from .asReadonly', () => {
      const s = signal(1);
      const doubled = computed(() => s() * 2);
      const readonly = deprecatedSetter(doubled, 'setValue', vi.fn()).asReadonly();

      s.set(2);
      expect(readonly()).toBe(4);
      expect(isWritableSignal(readonly)).toBe(false);
    });

    it('should return a read-only view of a read-only signal source from .asReadonly', () => {
      const s = signal(1);
      const readonly = deprecatedSetter(s.asReadonly(), 'setValue', vi.fn()).asReadonly();

      s.set(2);
      expect(readonly()).toBe(2);
      expect(isWritableSignal(readonly)).toBe(false);
    });
  });
});
