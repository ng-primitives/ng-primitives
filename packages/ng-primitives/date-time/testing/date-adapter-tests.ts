import type { NgpDateAdapter } from 'ng-primitives/date-time';

export function dateAdapterTests<T>(adapterClass: new () => NgpDateAdapter<T>) {
  describe('NgpDateAdapter via ' + adapterClass.name, () => {
    const adapter = new adapterClass();

    it('should get the day of the week (1-7)', () => {
      const lastOfAugust2025 = adapter.create({ year: 2025, month: 8, day: 31 }); // Aug 31st, 2025 is a Sunday
      expect(adapter.getDay(lastOfAugust2025)).toBe(7);
      expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 1 }))).toBe(1);
      expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 2 }))).toBe(2);
      expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 3 }))).toBe(3);
      expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 4 }))).toBe(4);
      expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 5 }))).toBe(5);
      expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 6 }))).toBe(6);
      expect(adapter.getDay(adapter.add(lastOfAugust2025, { days: 7 }))).toBe(7);
    });
  });
}
