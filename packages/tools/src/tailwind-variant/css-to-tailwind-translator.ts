import { CssDeclaration, ParsedCssEntry } from './component-styles-parser';

export interface TranslatedCssRule {
  /** The original, complete selector of the rule. */
  selector: string;
  /** The selector with liftable state/pseudo suffixes removed — where classes would live. */
  anchor: string;
  /** The rule's original declarations, for reconstructing it as raw CSS. */
  decls: CssDeclaration[];
  /** One Tailwind candidate per declaration (idiomatic pairs may span two classes). */
  candidates: { cls: string; prop: string; value: string }[];
  /** Non-motion @media params the rule lives under, if any. */
  media: string | null;
  /** The @media params the rule was authored under, motion or not. */
  sourceMedia: string | null;
  /** True when the rule cannot be expressed as element classes in raw Tailwind. */
  requiresRawCss: boolean;
}

export interface TailwindTranslationPlan {
  rules: TranslatedCssRule[];
  /** Raw @keyframes blocks — Tailwind never emits these, they pass through verbatim. */
  keyframes: string[];
  /** Authoring hazards for the raw-Tailwind variant that the derived CSS is immune to. */
  notes: string[];
}

// Declarations whose named utility compiles (after flattening) to exactly the
// same output. Everything absent here falls back to an arbitrary property,
// which compiles to the literal declaration — so this table only affects how
// idiomatic the authored classes look, never parity.
const EXACT_DECLARATION_UTILITIES = new Map<string, string>(
  Object.entries({
    'display:flex': 'flex',
    'display:inline-flex': 'inline-flex',
    'display:block': 'block',
    'display:inline-block': 'inline-block',
    'display:grid': 'grid',
    'display:none': 'hidden',
    'position:relative': 'relative',
    'position:absolute': 'absolute',
    'position:fixed': 'fixed',
    'position:sticky': 'sticky',
    'align-items:center': 'items-center',
    'align-items:flex-start': 'items-start',
    'align-items:flex-end': 'items-end',
    'align-items:baseline': 'items-baseline',
    'align-items:stretch': 'items-stretch',
    'justify-content:center': 'justify-center',
    'justify-content:space-between': 'justify-between',
    'justify-content:flex-start': 'justify-start',
    'justify-content:flex-end': 'justify-end',
    'flex-direction:column': 'flex-col',
    'flex-direction:row': 'flex-row',
    'flex-wrap:wrap': 'flex-wrap',
    'overflow:hidden': 'overflow-hidden',
    'overflow:auto': 'overflow-auto',
    'overflow-y:auto': 'overflow-y-auto',
    'overflow-x:auto': 'overflow-x-auto',
    'cursor:pointer': 'cursor-pointer',
    'cursor:not-allowed': 'cursor-not-allowed',
    'cursor:default': 'cursor-default',
    'box-sizing:border-box': 'box-border',
    'width:100%': 'w-full',
    'height:100%': 'h-full',
    'width:fit-content': 'w-fit',
    'height:fit-content': 'h-fit',
    'width:auto': 'w-auto',
    'height:auto': 'h-auto',
    'text-align:center': 'text-center',
    'text-align:left': 'text-left',
    'user-select:none': 'select-none',
    'pointer-events:none': 'pointer-events-none',
    'pointer-events:auto': 'pointer-events-auto',
    'flex:1': 'flex-1',
    'flex-shrink:0': 'shrink-0',
    'flex-grow:1': 'grow',
    'list-style:none': 'list-none',
    'text-decoration:none': 'no-underline',
    'white-space:nowrap': 'whitespace-nowrap',
    'vertical-align:middle': 'align-middle',
    'border:none': 'border-none',
    'background:transparent': 'bg-transparent',
    'background-color:transparent': 'bg-transparent',
    'font-weight:500': 'font-medium',
    'font-weight:600': 'font-semibold',
    'transform:rotate(180deg)': 'rotate-180',
    'transform:rotate(90deg)': 'rotate-90',
    'transform:rotate(45deg)': 'rotate-45',
    'border-radius:9999px': 'rounded-full',
    'line-height:1': 'leading-none',
    'opacity:0': 'opacity-0',
    'opacity:1': 'opacity-100',
    'border-collapse:collapse': 'border-collapse',
    'appearance:none': 'appearance-none',
  }),
);

const SPACING_SCALE_PREFIXES = new Map<string, string>(
  Object.entries({
    'padding-left': 'pl',
    'padding-right': 'pr',
    'padding-top': 'pt',
    'padding-bottom': 'pb',
    'padding-inline': 'px',
    'padding-block': 'py',
    'margin-left': 'ml',
    'margin-right': 'mr',
    'margin-top': 'mt',
    'margin-bottom': 'mb',
    'margin-inline': 'mx',
    'margin-block': 'my',
    gap: 'gap',
    'column-gap': 'gap-x',
    'row-gap': 'gap-y',
    width: 'w',
    height: 'h',
    'min-width': 'min-w',
    'min-height': 'min-h',
    'max-width': 'max-w',
    'max-height': 'max-h',
    top: 'top',
    right: 'right',
    bottom: 'bottom',
    left: 'left',
    inset: 'inset',
  }),
);

const BORDER_RADIUS_UTILITIES = new Map<string, string>([
  ['0.25rem', 'rounded'],
  ['0.375rem', 'rounded-md'],
  ['0.5rem', 'rounded-lg'],
  ['0.75rem', 'rounded-xl'],
  ['1rem', 'rounded-2xl'],
  ['1.5rem', 'rounded-3xl'],
]);

const COLOR_PROPERTY_UTILITIES = new Map<string, string>(
  Object.entries({
    color: 'text',
    'background-color': 'bg',
    'border-color': 'border',
    'outline-color': 'outline',
    'accent-color': 'accent',
    fill: 'fill',
    stroke: 'stroke',
  }),
);

const FONT_SIZE_LINE_HEIGHT_PAIRS = new Map<string, string>([
  ['0.75rem/1rem', 'text-xs'],
  ['0.875rem/1.25rem', 'text-sm'],
  ['1rem/1.5rem', 'text-base'],
]);

/** rem/px length -> spacing-scale steps, or null when off the 0.25rem scale. */
function spacingScaleSteps(value: string): number | null {
  if (value === '0') {
    return 0;
  }
  let rem: number | null = null;
  const remMatch = value.match(/^(-?\d*\.?\d+)rem$/);
  if (remMatch) {
    rem = Number(remMatch[1]);
  } else {
    const pxMatch = value.match(/^(-?\d*\.?\d+)px$/);
    if (pxMatch) {
      rem = Number(pxMatch[1]) / 16;
    }
  }
  if (rem === null) {
    return null;
  }
  const steps = rem / 0.25;
  return Number.isInteger(steps) ? steps : null;
}

/** Arbitrary-value encoding: spaces become underscores. */
const toArbitraryValue = (value: string): string => value.replace(/\s+/g, '_');

interface TranslatedDeclaration {
  cls: string;
  consumedNext?: boolean;
}

/**
 * Translate one declaration into Tailwind. `next` allows pairing font-size
 * with its scale line-height into a single text-* utility.
 */
export function translateDeclarationToTailwind(
  prop: string,
  value: string,
  next?: CssDeclaration,
): TranslatedDeclaration {
  const v = value.trim().replace(/\s+/g, ' ');
  const exactUtility = EXACT_DECLARATION_UTILITIES.get(`${prop}:${v}`);
  if (exactUtility) {
    return { cls: exactUtility };
  }

  const spacingPrefix = SPACING_SCALE_PREFIXES.get(prop);
  if (spacingPrefix && !v.includes(' ')) {
    const steps = spacingScaleSteps(v);
    if (steps !== null && steps >= 0) {
      return { cls: `${spacingPrefix}-${steps}` };
    }
    if (v === '50%' && ['top', 'left', 'right', 'bottom'].includes(prop)) {
      return { cls: `${prop}-1/2` };
    }
  }

  if (prop === 'padding' || prop === 'margin') {
    const prefix = prop === 'padding' ? 'p' : 'm';
    const parts = v.split(' ').map(spacingScaleSteps);
    if (!parts.some(steps => steps === null || steps < 0)) {
      if (parts.length === 1) {
        return { cls: `${prefix}-${parts[0]}` };
      }
      if (parts.length === 2) {
        return {
          cls:
            parts[0] === parts[1]
              ? `${prefix}-${parts[0]}`
              : `${prefix}y-${parts[0]} ${prefix}x-${parts[1]}`,
        };
      }
    }
  }

  if (prop === 'border-radius') {
    const rem = v.replace(/^(\d+)px$/, (_, px) => `${Number(px) / 16}rem`);
    const radiusUtility = BORDER_RADIUS_UTILITIES.get(rem);
    if (radiusUtility) {
      return { cls: radiusUtility };
    }
  }

  const colorUtility = COLOR_PROPERTY_UTILITIES.get(prop);
  if (colorUtility) {
    const varMatch = v.match(/^var\((--[\w-]+)\)$/);
    if (varMatch) {
      return { cls: `${colorUtility}-(${varMatch[1]})` };
    }
  }

  if (prop === 'box-shadow') {
    const varMatch = v.match(/^var\((--[\w-]+)\)$/);
    if (varMatch) {
      return { cls: `shadow-(${varMatch[1]})` };
    }
  }

  if (/^border(-top|-right|-bottom|-left)?$/.test(prop)) {
    const match = v.match(/^(\d+px) solid (var\(--[\w-]+\)|#[0-9a-fA-F]+)$/);
    if (match) {
      const width = { '1px': '', '2px': '-2', '4px': '-4' }[match[1]];
      if (width !== undefined) {
        const side = prop === 'border' ? '' : `-${prop.slice(7)[0]}`;
        const varMatch = match[2].match(/^var\((--[\w-]+)\)$/);
        const color = varMatch ? `border-(${varMatch[1]})` : `border-[${match[2]}]`;
        return { cls: `border${side}${width} ${color}` };
      }
    }
  }
  if (prop === 'border-width') {
    const widthUtility = { '1px': 'border', '2px': 'border-2', '4px': 'border-4' }[v];
    if (widthUtility) {
      return { cls: widthUtility };
    }
  }

  if (prop === 'font-size' && next?.prop === 'line-height') {
    const pairUtility = FONT_SIZE_LINE_HEIGHT_PAIRS.get(`${v}/${next.value.trim()}`);
    if (pairUtility) {
      return { cls: pairUtility, consumedNext: true };
    }
  }

  if (prop === 'animation') {
    return { cls: `animate-[${toArbitraryValue(v)}]` };
  }

  if (prop === 'z-index' && /^\d+$/.test(v)) {
    return { cls: `z-${v}` };
  }
  if (prop === 'opacity' && /^0?\.\d+$/.test(v)) {
    const percentage = Number(v) * 100;
    if (Number.isInteger(percentage)) {
      return { cls: `opacity-${percentage}` };
    }
  }

  return { cls: `[${prop}:${toArbitraryValue(v)}]` };
}

// Suffix patterns liftable off the end of a selector into Tailwind variants.
const LIFTABLE_SELECTOR_SUFFIXES: { re: RegExp; tw: (m: RegExpMatchArray) => string }[] = [
  { re: /\[data-([a-z-]+)='([^']+)'\]$/, tw: m => `data-[${m[1]}=${m[2]}]` },
  { re: /\[data-([a-z-]+)="([^"]+)"\]$/, tw: m => `data-[${m[1]}=${m[2]}]` },
  { re: /\[data-([a-z-]+)\]$/, tw: m => `data-${m[1]}` },
  { re: /::placeholder$/, tw: () => 'placeholder' },
  { re: /::?before$/, tw: () => 'before' },
  { re: /::?after$/, tw: () => 'after' },
  { re: /::selection$/, tw: () => 'selection' },
  { re: /:hover$/, tw: () => 'hover' },
  { re: /:focus-visible$/, tw: () => 'focus-visible' },
  { re: /:focus-within$/, tw: () => 'focus-within' },
  { re: /:focus$/, tw: () => 'focus' },
  { re: /:disabled$/, tw: () => 'disabled' },
  { re: /:first-child$/, tw: () => 'first' },
  { re: /:last-child$/, tw: () => 'last' },
  { re: /(::-webkit-[a-z-]+)$/, tw: m => `[&${m[1]}]` },
  { re: /(:not\([^()]*(?:\([^()]*\))?[^()]*\))$/, tw: m => `[&${toArbitraryValue(m[1])}]` },
  { re: /(:has\([^()]*(?:\([^()]*\))?[^()]*\))$/, tw: m => `[&${toArbitraryValue(m[1])}]` },
];

/**
 * Split a selector into an anchor plus Tailwind variants by lifting
 * recognisable state/pseudo suffixes off the end. Anything unliftable stays in
 * the anchor — the derive step re-scopes onto it directly, so no selector
 * shape is ever unsupported.
 */
export function splitSelectorIntoAnchorAndVariants(selector: string): {
  anchor: string;
  variants: string[];
} {
  let anchor = selector.trim();
  const variants: string[] = [];
  let progressed = true;
  while (progressed) {
    progressed = false;
    for (const { re, tw } of LIFTABLE_SELECTOR_SUFFIXES) {
      const match = anchor.match(re);
      if (!match) {
        continue;
      }
      const rest = anchor.slice(0, -match[0].length);
      // never lift a suffix across a combinator into a different compound
      if (!rest || /[\s>+~]$/.test(rest)) {
        break;
      }
      variants.unshift(tw(match));
      anchor = rest;
      progressed = true;
      break;
    }
  }
  return { anchor: anchor || selector.trim(), variants };
}

// Anchors that can carry classes directly: the host, a directive attribute, an
// element tag, or a semantic class — optionally combined on one compound.
const CLASS_CARRYING_ANCHOR = /^(:host|\[[\w-]+\]|[a-z][\w-]*|\.[\w-]+)+$/;

/**
 * Translate parsed CSS entries into a Tailwind candidate plan, collecting the
 * authoring hazards (`all: unset`, order-dependent custom properties) that the
 * raw-Tailwind variant cannot express but the derived CSS is immune to.
 */
export function translateCssToTailwind(entries: ParsedCssEntry[]): TailwindTranslationPlan {
  const rules: TranslatedCssRule[] = [];
  const keyframes: string[] = [];
  const notes: string[] = [];
  const customPropertyWriters = new Map<string, Set<string>>();
  const orderDependentSelectors = new Set<string>();

  // Angular scopes component @keyframes (`slideDown` -> `_ngcontent-x_slideDown`),
  // so an animation referencing one only resolves from the same styles block — a
  // global Tailwind class would silently reference a name that no longer exists.
  const localKeyframeNames = new Set(
    entries
      .filter(
        (entry): entry is ParsedCssEntry & { kind: 'keyframes' } => entry.kind === 'keyframes',
      )
      .map(entry => entry.name),
  );
  const referencesLocalKeyframe = (decl: CssDeclaration): boolean =>
    (decl.prop === 'animation' || decl.prop === 'animation-name') &&
    [...localKeyframeNames].some(name =>
      new RegExp(`(^|[\\s,])${name}([\\s,]|$)`).test(decl.value),
    );

  const handleRule = (
    selector: string,
    decls: CssDeclaration[],
    mediaParams: string | null,
  ): void => {
    const { anchor, variants } = splitSelectorIntoAnchorAndVariants(selector);
    const isMotionMedia = mediaParams?.includes('prefers-reduced-motion');
    const variantPrefix = isMotionMedia ? [...variants, 'motion-reduce'] : variants;
    const media = mediaParams && !isMotionMedia ? mediaParams : null;
    const candidates: TranslatedCssRule['candidates'] = [];
    let requiresRawCss =
      !CLASS_CARRYING_ANCHOR.test(anchor) || media !== null || decls.some(referencesLocalKeyframe);

    for (let i = 0; i < decls.length; i++) {
      const { prop, value } = decls[i];
      if (prop === 'all' && value === 'unset') {
        // component styles are unlayered and would beat @layer utilities, so a
        // reset rule can only live in raw CSS with its companions
        requiresRawCss = true;
        notes.push(
          `ALL_UNSET: \`${selector}\` — Tailwind's own emission order would reset later utilities; safe in derived CSS only`,
        );
      }
      if (prop.startsWith('--')) {
        const writers = customPropertyWriters.get(prop) ?? new Set<string>();
        writers.add(selector);
        customPropertyWriters.set(prop, writers);
      }
      const translated = translateDeclarationToTailwind(prop, value, decls[i + 1]);
      for (const cls of translated.cls.split(' ')) {
        candidates.push({
          cls: variantPrefix.length ? `${variantPrefix.join(':')}:${cls}` : cls,
          prop,
          value,
        });
      }
      if (translated.consumedNext) {
        i++;
      }
    }

    rules.push({
      selector,
      anchor,
      decls,
      candidates,
      media,
      sourceMedia: mediaParams,
      requiresRawCss,
    });
  };

  for (const entry of entries) {
    if (entry.kind === 'rule') {
      handleRule(entry.selector, entry.decls, null);
    } else if (entry.kind === 'media') {
      for (const rule of entry.rules) {
        handleRule(rule.selector, rule.decls, entry.params);
      }
    } else {
      keyframes.push(entry.css);
    }
  }

  for (const [prop, writers] of customPropertyWriters) {
    if (writers.size > 1) {
      notes.push(
        `ORDER_DEPENDENT: \`${prop}\` written by ${writers.size} selectors — source order decides the cascade; Tailwind's emission order would not preserve it`,
      );
      for (const selector of writers) {
        orderDependentSelectors.add(selector);
      }
    }
  }
  // rules in an order-dependent cascade only stay correct in raw CSS, where
  // authored order survives
  for (const rule of rules) {
    if (orderDependentSelectors.has(rule.selector)) {
      rule.requiresRawCss = true;
    }
  }

  // an animation kept as raw CSS is unlayered and beats @layer utilities, so a
  // companion `motion-reduce:[animation-duration:0s]` class could never win —
  // animation-* tweaks on those selectors must stay raw CSS alongside it
  const animationResidualSelectors = new Set(
    rules
      .filter(rule => rule.requiresRawCss && rule.decls.some(referencesLocalKeyframe))
      .map(rule => rule.selector),
  );
  for (const rule of rules) {
    if (
      animationResidualSelectors.has(rule.selector) &&
      rule.decls.every(decl => decl.prop.startsWith('animation'))
    ) {
      rule.requiresRawCss = true;
    }
  }

  return { rules, keyframes, notes };
}
