import { extractComponentStyles, parseCssRules } from './component-styles-parser';
import { TranslatedCssRule, translateCssToTailwind } from './css-to-tailwind-translator';

export interface TailwindComponentVariant {
  source: string;
  /** The class list injected on each anchor, for inspection and tests. */
  classesByAnchor: Map<string, string[]>;
  /** Rules kept as raw CSS because Tailwind classes cannot express them. */
  rawCssRules: string[];
}

interface AnchorTarget {
  tag: string | null;
  attributes: string[];
  classes: string[];
}

/**
 * Break a class-carrying anchor into the pieces an element must match:
 * an optional tag, directive attributes, and static classes.
 * Returns null for anchors that cannot sit on a single element (`:host`,
 * combinators, pseudo-classes left in the anchor).
 */
function parseAnchorTarget(anchor: string): AnchorTarget | null {
  const match = anchor.match(/^([a-z][\w-]*)?((?:\[[\w-]+\]|\.[\w-]+)*)$/);
  if (!match || (!match[1] && !match[2])) {
    return null;
  }
  const attributes: string[] = [];
  const classes: string[] = [];
  for (const part of match[2]?.match(/\[[\w-]+\]|\.[\w-]+/g) ?? []) {
    if (part.startsWith('[')) {
      attributes.push(part.slice(1, -1));
    } else {
      classes.push(part.slice(1));
    }
  }
  return { tag: match[1] ?? null, attributes, classes };
}

const OPENING_TAG_PATTERN = /<([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;

/** Whether one opening tag carries every attribute and class the target demands. */
function elementMatchesTarget(tag: string, attrs: string, target: AnchorTarget): boolean {
  if (target.tag && target.tag !== tag.toLowerCase()) {
    return false;
  }
  for (const attribute of target.attributes) {
    if (!new RegExp(`(?:^|\\s)${attribute}(?:[\\s=/]|$)`).test(attrs)) {
      return false;
    }
  }
  if (target.classes.length) {
    const staticClass = attrs.match(/(?:^|\s)class="([^"]*)"/);
    if (!staticClass) {
      return false;
    }
    const present = staticClass[1].split(/\s+/);
    if (!target.classes.every(cls => present.includes(cls))) {
      return false;
    }
  }
  return true;
}

/** Merge classes into one opening tag, appending to an existing static class attribute. */
function injectClassesIntoTag(tag: string, attrs: string, classes: string[]): string {
  const staticClass = attrs.match(/((?:^|\s)class=")([^"]*)"/);
  if (staticClass) {
    const merged = attrs.replace(
      staticClass[0],
      `${staticClass[1]}${staticClass[2]} ${classes.join(' ')}"`,
    );
    return `<${tag}${merged}>`;
  }
  return `<${tag} class="${classes.join(' ')}"${attrs}>`;
}

/** Reconstruct a translated rule as raw CSS, restoring its @media wrapper. */
function reconstructRawCssRule(rule: TranslatedCssRule): string {
  const declarations = rule.decls.map(decl => `${decl.prop}: ${decl.value};`);
  const body = `${rule.selector} {\n${declarations.map(line => `  ${line}`).join('\n')}\n}`;
  if (rule.sourceMedia) {
    return `@media ${rule.sourceMedia} {\n${body
      .split('\n')
      .map(line => `  ${line}`)
      .join('\n')}\n}`;
  }
  return body;
}

/**
 * Generate the Tailwind variant of a reusable component: every rule whose
 * anchor is an element the template actually contains becomes classes on that
 * element (`:host` rules become a `host` class binding), and everything
 * Tailwind cannot express — keyframes, combinator rules, `all: unset` resets,
 * order-dependent cascades — stays behind as a raw `styles` block.
 *
 * Falls back to raw CSS whenever an anchor matches nothing in the template, so
 * a rule is never silently dropped.
 */
export function generateTailwindComponentVariant(source: string): TailwindComponentVariant {
  const css = extractComponentStyles(source);
  if (!css) {
    return { source, classesByAnchor: new Map(), rawCssRules: [] };
  }

  const plan = translateCssToTailwind(parseCssRules(css));
  const templateMatch = source.match(/template:\s*`([\s\S]*?)`/);
  let template = templateMatch ? templateMatch[1] : null;

  const classesByAnchor = new Map<string, string[]>();
  const hostClasses: string[] = [];
  const rawCssRules: string[] = [];

  for (const rule of plan.rules) {
    const classes = rule.candidates.map(candidate => candidate.cls);
    // a `:host` inside an arbitrary variant would land in the consumer's global
    // stylesheet, where :host matches nothing — only raw component CSS can say it
    const variantReferencesHost = classes.some(cls => cls.includes(':host'));
    // a double quote would close the template's class="..." attribute
    const breaksClassAttribute = rule.anchor !== ':host' && classes.some(cls => cls.includes('"'));
    if (rule.requiresRawCss || variantReferencesHost || breaksClassAttribute) {
      rawCssRules.push(reconstructRawCssRule(rule));
      continue;
    }
    if (rule.anchor === ':host') {
      hostClasses.push(...classes);
      classesByAnchor.set(':host', [...(classesByAnchor.get(':host') ?? []), ...classes]);
      continue;
    }
    const target = template ? parseAnchorTarget(rule.anchor) : null;
    const matches = target
      ? [...template!.matchAll(OPENING_TAG_PATTERN)].filter(m =>
          elementMatchesTarget(m[1], m[2], target),
        )
      : [];
    if (!target || matches.length === 0) {
      rawCssRules.push(reconstructRawCssRule(rule));
      continue;
    }
    classesByAnchor.set(rule.anchor, [...(classesByAnchor.get(rule.anchor) ?? []), ...classes]);
  }

  // inject the accumulated classes per anchor in one template pass each
  if (template) {
    for (const [anchor, classes] of classesByAnchor) {
      if (anchor === ':host') {
        continue;
      }
      const target = parseAnchorTarget(anchor);
      if (!target) {
        continue;
      }
      template = template.replace(OPENING_TAG_PATTERN, (full, tag: string, attrs: string) =>
        elementMatchesTarget(tag, attrs, target) ? injectClassesIntoTag(tag, attrs, classes) : full,
      );
    }
  }

  let result = source;
  if (template !== null && templateMatch) {
    result = result.replace(templateMatch[0], `template: \`${template}\``);
  }

  if (hostClasses.length) {
    // the host class lives in a single-quoted TS string — `[content:'']` must not close it
    const hostClassValue = hostClasses.join(' ').replace(/'/g, "\\'");
    const existingHost = result.match(/host:\s*\{/);
    if (existingHost) {
      const existingClass = result.match(/(host:\s*\{[\s\S]*?class:\s*')([^']*)'/);
      result = existingClass
        ? result.replace(
            existingClass[0],
            `${existingClass[1]}${existingClass[2]} ${hostClassValue}'`,
          )
        : result.replace(/host:\s*\{/, `host: {\n    class: '${hostClassValue}',`);
    } else {
      result = result.replace(
        /(\n\s*)template:/,
        `$1host: {$1  class: '${hostClassValue}',$1},$1template:`,
      );
    }
  }

  // keyframes keep their source indentation; strip it so the block re-indents cleanly
  const reindentedKeyframes = plan.keyframes.map(block => {
    const lines = block.split('\n');
    const indents = lines
      .slice(1)
      .filter(line => line.trim())
      .map(line => line.match(/^\s*/)![0].length);
    const common = indents.length ? Math.min(...indents) - 2 : 0;
    return [lines[0], ...lines.slice(1).map(line => line.slice(Math.max(common, 0)))].join('\n');
  });
  const residual = [...rawCssRules, ...reindentedKeyframes];
  const stylesMatch = result.match(
    /(\s*)styles:\s*`[\s\S]*?`\s*,?(?=\s*\n\s*(?:host|template|imports|providers|changeDetection|animations|encapsulation|\}\)))/,
  );
  if (stylesMatch) {
    if (residual.length === 0) {
      result = result.replace(stylesMatch[0], '');
    } else {
      const indented = residual
        .join('\n\n')
        .split('\n')
        .map(line => (line.trim() ? `    ${line}` : line))
        .join('\n');
      result = result.replace(stylesMatch[0], `${stylesMatch[1]}styles: \`\n${indented}\n  \`,`);
    }
  }

  return { source: result, classesByAnchor, rawCssRules };
}
