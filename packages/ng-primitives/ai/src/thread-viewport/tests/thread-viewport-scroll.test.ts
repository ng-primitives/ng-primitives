import { describe, expect, it } from 'vitest';
import {
  classifyAddedElements,
  compensatePrependedScroll,
  extractAddedElements,
} from '../thread-viewport-scroll';

describe('thread-viewport-scroll', () => {
  describe('extractAddedElements', () => {
    it('should extract only HTMLElement instances from mutation records', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('span');
      const textNode = document.createTextNode('text');
      const commentNode = document.createComment('comment');

      const mutation: Partial<MutationRecord> = {
        addedNodes: [el1, textNode, el2, commentNode] as unknown as NodeList,
      };

      const result = extractAddedElements([mutation as MutationRecord]);
      expect(result).toEqual([el1, el2]);
    });

    it('should return an empty array if no element nodes were added', () => {
      const textNode = document.createTextNode('text');
      const mutation: Partial<MutationRecord> = {
        addedNodes: [textNode] as unknown as NodeList,
      };

      expect(extractAddedElements([mutation as MutationRecord])).toEqual([]);
    });
  });

  describe('classifyAddedElements', () => {
    it('should treat all added elements as appended when container has no existing children', () => {
      const container = document.createElement('div');
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      container.append(el1, el2);

      const result = classifyAddedElements(container, [el1, el2]);
      expect(result.hasPrepended).toBe(false);
      expect(result.hasAppended).toBe(true);
      expect(result.firstExisting).toBeUndefined();
    });

    it('should classify prepended elements added before existing children', () => {
      const container = document.createElement('div');
      const existing = document.createElement('div');
      const prepended = document.createElement('div');

      container.append(prepended, existing);

      const result = classifyAddedElements(container, [prepended]);
      expect(result.hasPrepended).toBe(true);
      expect(result.hasAppended).toBe(false);
      expect(result.firstPrepended).toBe(prepended);
      expect(result.firstExisting).toBe(existing);
    });

    it('should classify appended elements added after existing children', () => {
      const container = document.createElement('div');
      const existing = document.createElement('div');
      const appended = document.createElement('div');

      container.append(existing, appended);

      const result = classifyAddedElements(container, [appended]);
      expect(result.hasPrepended).toBe(false);
      expect(result.hasAppended).toBe(true);
      expect(result.firstExisting).toBe(existing);
    });

    it('should classify both when elements are prepended and appended simultaneously', () => {
      const container = document.createElement('div');
      const prepended = document.createElement('div');
      const existing = document.createElement('div');
      const appended = document.createElement('div');

      container.append(prepended, existing, appended);

      const result = classifyAddedElements(container, [prepended, appended]);
      expect(result.hasPrepended).toBe(true);
      expect(result.hasAppended).toBe(true);
      expect(result.firstPrepended).toBe(prepended);
      expect(result.firstExisting).toBe(existing);
    });

    it('should select the first prepended element in container DOM order regardless of mutation order', () => {
      const container = document.createElement('div');
      const existing = document.createElement('div');
      const prependedA = document.createElement('div');
      const prependedB = document.createElement('div');

      // DOM order: prependedB, prependedA, existing
      container.append(prependedB, prependedA, existing);

      // Mutation order: prependedA, prependedB
      const result = classifyAddedElements(container, [prependedA, prependedB]);
      expect(result.hasPrepended).toBe(true);
      expect(result.firstPrepended).toBe(prependedB);
      expect(result.firstExisting).toBe(existing);
    });
  });

  describe('compensatePrependedScroll', () => {
    function createMockViewport(initialScrollTop: number): HTMLElement {
      const viewport = document.createElement('div');
      let currentScrollTop = initialScrollTop;

      Object.defineProperty(viewport, 'scrollTop', {
        get: () => currentScrollTop,
        set: (value: number) => {
          currentScrollTop = value;
        },
        configurable: true,
      });

      return viewport;
    }

    it('should compensate scroll position when browser has not shifted scrollTop', () => {
      const viewport = createMockViewport(200);

      const firstPrepended = document.createElement('div');
      const firstExisting = document.createElement('div');

      firstExisting.getBoundingClientRect = () => ({ top: 300 }) as DOMRect;
      firstPrepended.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;

      compensatePrependedScroll(viewport, firstPrepended, firstExisting, 200);

      expect(viewport.scrollTop).toBe(500);
    });

    it('should deduct native shift if browser scroll anchoring already applied partial compensation', () => {
      const viewport = createMockViewport(300);

      const firstPrepended = document.createElement('div');
      const firstExisting = document.createElement('div');

      firstExisting.getBoundingClientRect = () => ({ top: 300 }) as DOMRect;
      firstPrepended.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;

      compensatePrependedScroll(viewport, firstPrepended, firstExisting, 200);

      expect(viewport.scrollTop).toBe(500);
    });

    it('should not adjust scrollTop if native shift fully covers the prepended height', () => {
      const viewport = createMockViewport(500);

      const firstPrepended = document.createElement('div');
      const firstExisting = document.createElement('div');

      firstExisting.getBoundingClientRect = () => ({ top: 300 }) as DOMRect;
      firstPrepended.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;

      compensatePrependedScroll(viewport, firstPrepended, firstExisting, 200);

      expect(viewport.scrollTop).toBe(500);
    });

    it('should not adjust scrollTop if native shift exceeds the prepended height', () => {
      const viewport = createMockViewport(600);

      const firstPrepended = document.createElement('div');
      const firstExisting = document.createElement('div');

      firstExisting.getBoundingClientRect = () => ({ top: 300 }) as DOMRect;
      firstPrepended.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;

      compensatePrependedScroll(viewport, firstPrepended, firstExisting, 200);

      expect(viewport.scrollTop).toBe(600);
    });

    it('should not treat a negative scroll delta as native shift when scrollTop is less than lastScrollTop', () => {
      const viewport = createMockViewport(200);

      const firstPrepended = document.createElement('div');
      const firstExisting = document.createElement('div');

      firstExisting.getBoundingClientRect = () => ({ top: 300 }) as DOMRect;
      firstPrepended.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;

      compensatePrependedScroll(viewport, firstPrepended, firstExisting, 300);

      expect(viewport.scrollTop).toBe(500);
    });

    it('should do nothing if prepended height is zero or negative', () => {
      const viewport = createMockViewport(200);

      const firstPrepended = document.createElement('div');
      const firstExisting = document.createElement('div');

      firstExisting.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
      firstPrepended.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;

      compensatePrependedScroll(viewport, firstPrepended, firstExisting, 200);

      expect(viewport.scrollTop).toBe(200);
    });
  });
});
