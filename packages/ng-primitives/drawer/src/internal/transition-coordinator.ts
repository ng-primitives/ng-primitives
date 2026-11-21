/**
 * Slack (two 60Hz frames) on the CSS-only fallback timer, so it fires after the effect's final
 * frame has rendered rather than racing it.
 */
const CSS_FALLBACK_SLACK = 34;

/**
 * Buffer past the longest animation's end time before the safety timer gives up on `finished`.
 * Matches the shared exit-animation helper.
 */
const SAFETY_TIMEOUT_BUFFER = 50;

function toMilliseconds(value: string): number {
  const trimmed = value.trim();
  if (trimmed.endsWith('ms')) {
    return Number.parseFloat(trimmed) || 0;
  }
  if (trimmed.endsWith('s')) {
    return (Number.parseFloat(trimmed) || 0) * 1000;
  }
  return 0;
}

function toIterationCount(value: string): number {
  const trimmed = value.trim();
  if (trimmed === 'infinite') {
    return Infinity;
  }
  const count = Number.parseFloat(trimmed);
  return Number.isFinite(count) && count >= 0 ? count : 1;
}

function parseList(value: string | undefined): string[] {
  return value ? value.split(',').map(entry => entry.trim()) : [];
}

/** CSS repeats a shorter list until it covers every effect, so entry `index` wraps around. */
function entryAt<T>(list: readonly T[], index: number, fallback: T): T {
  return list.length ? list[index % list.length] : fallback;
}

interface CssEffectLists {
  /** `transition-property` or `animation-name`: its length is the number of effects. */
  readonly names: string;
  readonly durations: string;
  readonly delays: string;
  readonly iterations?: string;
}

/** The latest end time of any finite effect in one transition or animation list. */
function maximumEffectEnd({ names, durations, delays, iterations }: CssEffectLists): number {
  const nameList = parseList(names);
  const durationList = parseList(durations).map(toMilliseconds);
  const delayList = parseList(delays).map(toMilliseconds);
  const iterationList = parseList(iterations).map(toIterationCount);
  const count =
    nameList.length || Math.max(durationList.length, delayList.length, iterationList.length);

  let longest = 0;
  for (let index = 0; index < count; index++) {
    if (entryAt(nameList, index, '') === 'none') {
      continue;
    }
    const iterationCount = entryAt(iterationList, index, 1);
    // An infinite animation never ends, so it cannot gate the transition - the Web Animations
    // path skips these for the same reason.
    if (!Number.isFinite(iterationCount)) {
      continue;
    }
    const end = entryAt(delayList, index, 0) + entryAt(durationList, index, 0) * iterationCount;
    longest = Math.max(longest, end);
  }
  return longest;
}

function maximumCssDuration(style: CSSStyleDeclaration): number {
  return Math.max(
    maximumEffectEnd({
      names: style.transitionProperty,
      durations: style.transitionDuration,
      delays: style.transitionDelay,
    }),
    maximumEffectEnd({
      names: style.animationName,
      durations: style.animationDuration,
      delays: style.animationDelay,
      iterations: style.animationIterationCount,
    }),
  );
}

function finiteEndTime(animation: Animation): number | null {
  const endTime = animation.effect?.getComputedTiming().endTime;
  return typeof endTime === 'number' && Number.isFinite(endTime) ? endTime : null;
}

export function nextDrawerFrame(document: Document): Promise<void> {
  const view = document.defaultView;
  return new Promise(resolve => {
    if (view?.requestAnimationFrame) {
      view.requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export async function waitForDrawerTransition(
  elements: readonly HTMLElement[],
  document: Document,
): Promise<void> {
  await nextDrawerFrame(document);

  const supportsWebAnimations = elements.every(
    element => typeof element.getAnimations === 'function',
  );

  if (supportsWebAnimations) {
    const animations = [...new Set(elements.flatMap(element => element.getAnimations()))].filter(
      animation => finiteEndTime(animation) !== null,
    );
    if (animations.length === 0) {
      return;
    }
    const longestEnd = Math.max(...animations.map(animation => finiteEndTime(animation) ?? 0));
    let timer: ReturnType<typeof setTimeout> | undefined;
    // `finished` never settles for a paused animation, which would leave the portal stuck in its
    // exiting phase, so stop waiting shortly after the longest animation should have ended.
    const safetyTimeout = new Promise<void>(resolve => {
      timer = setTimeout(resolve, longestEnd + SAFETY_TIMEOUT_BUFFER);
    });
    await Promise.race([
      Promise.all(animations.map(animation => animation.finished.catch(() => undefined))),
      safetyTimeout,
    ]);
    clearTimeout(timer);
    return;
  }

  const view = document.defaultView;
  if (!view) {
    return;
  }
  const duration = Math.max(
    0,
    ...elements.map(element => maximumCssDuration(view.getComputedStyle(element))),
  );
  if (duration === 0) {
    return;
  }

  // Without `getAnimations` there is no way to tell which effect an end event belongs to, and the
  // first `transitionend` only reports the first property to finish - so wait out the longest
  // declared transition or animation instead.
  await new Promise<void>(resolve => {
    view.setTimeout(resolve, duration + CSS_FALLBACK_SLACK);
  });
}
