import type { NgpDateAdapter } from 'ng-primitives/date-time';

export function dateAdapterTests<T>(adapterClass: new () => NgpDateAdapter<T>) {
  describe('NgpDateAdapter via ' + adapterClass.name, () => {
    const adapter = new adapterClass();

    // A fixed reference date used across the getters. All time components are
    // provided explicitly so the assertions do not depend on the current time
    // (some adapters default missing units to `now`, others to zero).
    // Aug 15th, 2025 is a Friday.
    const reference = () =>
      adapter.create({
        year: 2025,
        month: 8,
        day: 15,
        hour: 12,
        minute: 30,
        second: 45,
        millisecond: 500,
      });

    it('should read back the units it was created with', () => {
      const date = reference();
      expect(adapter.getYear(date)).toBe(2025);
      expect(adapter.getDate(date)).toBe(15);
      expect(adapter.getHours(date)).toBe(12);
      expect(adapter.getMinutes(date)).toBe(30);
      expect(adapter.getSeconds(date)).toBe(45);
      expect(adapter.getMilliseconds(date)).toBe(500);
    });

    it('should create the current date and time via now()', () => {
      const now = adapter.now();
      expect(adapter.getYear(now)).toBeGreaterThanOrEqual(2025);
      // now() is later than a fixed date well in the past.
      expect(adapter.compare(now, adapter.create({ year: 2000, month: 1, day: 1 }))).toBe(1);
    });

    it('should set only the specified units, preserving the rest', () => {
      const date = reference(); // 2025-08-15 12:30:45.500
      const updated = adapter.set(date, { year: 2030, day: 3 });
      expect(adapter.getYear(updated)).toBe(2030);
      expect(adapter.getDate(updated)).toBe(3);
      // untouched units are preserved
      expect(adapter.getMonth(updated)).toBe(7); // still August
      expect(adapter.getHours(updated)).toBe(12);
      expect(adapter.getMinutes(updated)).toBe(30);
      expect(adapter.getSeconds(updated)).toBe(45);
      expect(adapter.getMilliseconds(updated)).toBe(500);
    });

    it('should overflow (not clamp) when set() is given a day past the month length', () => {
      // Unlike add/subtract, set does not clamp: 31st of February rolls into March.
      const result = adapter.set(adapter.create({ year: 2025, month: 2, day: 10 }), { day: 31 });
      expect(adapter.getMonth(result)).toBe(2); // March
      expect(adapter.getDate(result)).toBe(3);
    });

    it('should not mutate the input date when setting', () => {
      const date = reference();
      adapter.set(date, { year: 1999, day: 1 });
      expect(adapter.getYear(date)).toBe(2025);
      expect(adapter.getDate(date)).toBe(15);
    });

    it('should get the month as a zero-based number (0-11)', () => {
      expect(adapter.getMonth(adapter.create({ year: 2025, month: 1, day: 1 }))).toBe(0);
      expect(adapter.getMonth(reference())).toBe(7); // August
      expect(adapter.getMonth(adapter.create({ year: 2025, month: 12, day: 1 }))).toBe(11);
    });

    it('should round-trip getMonth through set (as the date picker does)', () => {
      const august = reference();
      const target = adapter.create({ year: 2020, month: 1, day: 10 }); // January
      const moved = adapter.set(target, { month: adapter.getMonth(august) });
      expect(adapter.getMonth(moved)).toBe(adapter.getMonth(august));
    });

    it('should normalize an out-of-range month by rolling into the next year', () => {
      // month 13 has no equivalent, so it rolls into January of the next year.
      const rolled = adapter.create({ year: 2025, month: 13, day: 10 });
      expect(adapter.getYear(rolled)).toBe(2026);
      expect(adapter.getMonth(rolled)).toBe(0); // January
      expect(adapter.getDate(rolled)).toBe(10);
    });

    it('should normalize a zero day into the last day of the previous month', () => {
      const rolled = adapter.create({ year: 2025, month: 1, day: 0 });
      expect(adapter.getYear(rolled)).toBe(2024);
      expect(adapter.getMonth(rolled)).toBe(11); // December
      expect(adapter.getDate(rolled)).toBe(31);
    });

    it('should normalize an out-of-range month passed to set()', () => {
      // set uses a 0-11 month, so month index 12 rolls into January of the next year.
      const rolled = adapter.set(reference(), { month: 12 });
      expect(adapter.getYear(rolled)).toBe(2026);
      expect(adapter.getMonth(rolled)).toBe(0); // January
      expect(adapter.getDate(rolled)).toBe(15);
      expect(adapter.getHours(rolled)).toBe(12); // other units preserved
    });

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

    it('should add each duration unit', () => {
      const date = reference();
      expect(adapter.getYear(adapter.add(date, { years: 1 }))).toBe(2026);
      expect(adapter.getDate(adapter.add(date, { days: 1 }))).toBe(16);
      expect(adapter.getHours(adapter.add(date, { hours: 1 }))).toBe(13);
      expect(adapter.getMinutes(adapter.add(date, { minutes: 1 }))).toBe(31);
      expect(adapter.getSeconds(adapter.add(date, { seconds: 1 }))).toBe(46);
      expect(adapter.getMilliseconds(adapter.add(date, { milliseconds: 1 }))).toBe(501);
    });

    it('should subtract each duration unit', () => {
      const date = reference();
      expect(adapter.getYear(adapter.subtract(date, { years: 1 }))).toBe(2024);
      expect(adapter.getDate(adapter.subtract(date, { days: 1 }))).toBe(14);
      expect(adapter.getHours(adapter.subtract(date, { hours: 1 }))).toBe(11);
      expect(adapter.getMinutes(adapter.subtract(date, { minutes: 1 }))).toBe(29);
      expect(adapter.getSeconds(adapter.subtract(date, { seconds: 1 }))).toBe(44);
      expect(adapter.getMilliseconds(adapter.subtract(date, { milliseconds: 1 }))).toBe(499);
    });

    it('should clamp the day when month/year arithmetic lands on a shorter month', () => {
      // 31 Jan + 1 month has no 31st in February, so clamp to the last day.
      const fromJan31 = adapter.add(adapter.create({ year: 2025, month: 1, day: 31 }), {
        months: 1,
      });
      expect(adapter.getMonth(fromJan31)).toBe(1); // February
      expect(adapter.getDate(fromJan31)).toBe(28);

      // 31 Mar - 1 month likewise clamps into February.
      const fromMar31 = adapter.subtract(adapter.create({ year: 2025, month: 3, day: 31 }), {
        months: 1,
      });
      expect(adapter.getMonth(fromMar31)).toBe(1); // February
      expect(adapter.getDate(fromMar31)).toBe(28);

      // 29 Feb (leap) + 1 year clamps to 28 Feb in a non-leap year.
      const fromLeap = adapter.add(adapter.create({ year: 2024, month: 2, day: 29 }), { years: 1 });
      expect(adapter.getYear(fromLeap)).toBe(2025);
      expect(adapter.getMonth(fromLeap)).toBe(1); // February
      expect(adapter.getDate(fromLeap)).toBe(28);
    });

    it('should apply month/year clamping before day and time deltas', () => {
      // Clamp 31 Jan + 1 month to 28 Feb, then add the 2 days -> 2 Mar, time preserved.
      const result = adapter.add(
        adapter.create({
          year: 2025,
          month: 1,
          day: 31,
          hour: 12,
          minute: 30,
          second: 0,
          millisecond: 0,
        }),
        { months: 1, days: 2 },
      );
      expect(adapter.getMonth(result)).toBe(2); // March
      expect(adapter.getDate(result)).toBe(2);
      expect(adapter.getHours(result)).toBe(12);
      expect(adapter.getMinutes(result)).toBe(30);
    });

    it('should not mutate the input date when adding or subtracting', () => {
      const date = reference();
      adapter.add(date, { days: 5 });
      adapter.subtract(date, { days: 5 });
      expect(adapter.getDate(date)).toBe(15);
    });

    it('should compare two dates', () => {
      const date = reference();
      const later = adapter.add(date, { days: 1 });
      expect(adapter.compare(date, later)).toBe(-1);
      expect(adapter.compare(later, date)).toBe(1);
      expect(adapter.compare(date, reference())).toBe(0);
    });

    it('should determine equality and ordering', () => {
      const date = reference();
      const later = adapter.add(date, { days: 1 });
      expect(adapter.isEqual(date, reference())).toBe(true);
      expect(adapter.isEqual(date, later)).toBe(false);
      expect(adapter.isBefore(date, later)).toBe(true);
      expect(adapter.isBefore(later, date)).toBe(false);
      expect(adapter.isAfter(later, date)).toBe(true);
      expect(adapter.isAfter(date, later)).toBe(false);
    });

    it('should determine same day, month and year', () => {
      const date = reference();
      const laterSameDay = adapter.add(date, { hours: 1 });
      const nextDay = adapter.add(date, { days: 1 });
      const nextMonth = adapter.add(date, { months: 1 });
      const nextYear = adapter.add(date, { years: 1 });

      expect(adapter.isSameDay(date, laterSameDay)).toBe(true);
      expect(adapter.isSameDay(date, nextDay)).toBe(false);

      expect(adapter.isSameMonth(date, laterSameDay)).toBe(true);
      expect(adapter.isSameMonth(date, nextMonth)).toBe(false);

      expect(adapter.isSameYear(date, nextMonth)).toBe(true);
      expect(adapter.isSameYear(date, nextYear)).toBe(false);
    });

    it('should not treat matching day/month numbers in a different period as the same', () => {
      const date = reference(); // 2025-08-15
      const sameDayNextMonth = adapter.create({ year: 2025, month: 9, day: 15 });
      const sameDateNextYear = adapter.create({ year: 2026, month: 8, day: 15 });

      // same day-of-month number, different month
      expect(adapter.isSameDay(date, sameDayNextMonth)).toBe(false);
      // same day and month, different year
      expect(adapter.isSameDay(date, sameDateNextYear)).toBe(false);
      expect(adapter.isSameMonth(date, sameDateNextYear)).toBe(false);
    });

    it('should get the start of the day', () => {
      const start = adapter.startOfDay(reference());
      expect(adapter.getDate(start)).toBe(15);
      expect(adapter.getHours(start)).toBe(0);
      expect(adapter.getMinutes(start)).toBe(0);
      expect(adapter.getSeconds(start)).toBe(0);
      expect(adapter.getMilliseconds(start)).toBe(0);
    });

    it('should get the end of the day', () => {
      const end = adapter.endOfDay(reference());
      expect(adapter.getDate(end)).toBe(15);
      expect(adapter.getHours(end)).toBe(23);
      expect(adapter.getMinutes(end)).toBe(59);
      expect(adapter.getSeconds(end)).toBe(59);
      expect(adapter.getMilliseconds(end)).toBe(999);
    });

    it('should get the start of the month', () => {
      const start = adapter.startOfMonth(reference());
      expect(adapter.getDate(start)).toBe(1);
      expect(adapter.getHours(start)).toBe(0);
      expect(adapter.getMinutes(start)).toBe(0);
    });

    it('should get the last day of the month at the end of the day', () => {
      const end = adapter.endOfMonth(reference());
      expect(adapter.getDate(end)).toBe(31);
      expect(adapter.getHours(end)).toBe(23);
      expect(adapter.getMinutes(end)).toBe(59);
      expect(adapter.getSeconds(end)).toBe(59);
      expect(adapter.getMilliseconds(end)).toBe(999);
    });
  });
}
