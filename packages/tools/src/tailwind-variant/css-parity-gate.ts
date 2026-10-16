import { ParsedCssEntry } from './component-styles-parser';

// Semantic parity: normalise hand-written and derived CSS to a canonical
// (selector, physical longhand, canonical value) map and compare. This is the
// gate that makes deriving CSS from Tailwind safe — any drift the compiler
// introduces surfaces as a diff instead of shipping silently.

const SIDES = ['top', 'right', 'bottom', 'left'] as const;

function normaliseCssValue(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/'/g, '"')
    .replace(/(\d*\.?\d+)px\b/g, (_, n: string) => `${Number((Number(n) / 16).toFixed(5))}rem`)
    .replace(/\b0(?:rem|px|em|%)\b/g, '0')
    .replace(/(\d*\.?\d+)s\b/g, (_, n: string) => `${Number(n) * 1000}ms`)
    .replace(/\b0\./g, '.')
    .replace(/,\s+/g, ',')
    .replace(/calc\(infinity \* 1px\)/g, '9999px');
}

/** Split a multi-part value on spaces outside parentheses (var fallbacks contain both). */
function splitOutsideParentheses(value: string): string[] {
  return value.trim().split(/\s+(?![^(]*\))/);
}

function expandBoxShorthand(value: string): [string, string, string, string] {
  const parts = splitOutsideParentheses(value);
  if (parts.length === 1) {
    return [parts[0], parts[0], parts[0], parts[0]];
  }
  if (parts.length === 2) {
    return [parts[0], parts[1], parts[0], parts[1]];
  }
  if (parts.length === 3) {
    return [parts[0], parts[1], parts[2], parts[1]];
  }
  return [parts[0], parts[1], parts[2], parts[3]];
}

const COLOR_VALUE_PATTERN =
  /^(#|rgb|hsl|oklch|var\(|transparent$|currentcolor$|inherit$|white$|black$)/i;
const COLOR_TOKEN_PATTERN =
  /(var\([^)]*\)|rgba?\([^)]*\)|hsla?\([^)]*\)|oklch\([^)]*\)|#[0-9a-fA-F]+|transparent|currentcolor)/i;

/** Expand a declaration into physical longhands so shorthand vs longhand compare equal. */
function expandToPhysicalLonghands(prop: string, value: string): [string, string][] {
  const v = value.trim();
  switch (prop) {
    case 'padding':
    case 'margin': {
      const box = expandBoxShorthand(v);
      return SIDES.map((side, i) => [`${prop}-${side}`, box[i]] as [string, string]);
    }
    case 'padding-inline':
    case 'margin-inline': {
      const base = prop.split('-')[0];
      const parts = splitOutsideParentheses(v);
      return [
        [`${base}-left`, parts[0]],
        [`${base}-right`, parts[1] ?? parts[0]],
      ];
    }
    case 'padding-block':
    case 'margin-block': {
      const base = prop.split('-')[0];
      const parts = splitOutsideParentheses(v);
      return [
        [`${base}-top`, parts[0]],
        [`${base}-bottom`, parts[1] ?? parts[0]],
      ];
    }
    case 'inset': {
      const [top, right, bottom, left] = expandBoxShorthand(v);
      return [
        ['top', top],
        ['right', right],
        ['bottom', bottom],
        ['left', left],
      ];
    }
    case 'border':
    case 'border-top':
    case 'border-right':
    case 'border-bottom':
    case 'border-left': {
      const sides = prop === 'border' ? SIDES : [prop.slice(7)];
      const out: [string, string][] = [];
      const emit = (kind: string, val: string): void => {
        for (const side of sides) {
          out.push([`border-${side}-${kind}`, val]);
        }
      };
      if (v === 'none' || v === '0') {
        emit('style', 'none');
        return out;
      }
      // pull the color out first so its internal spaces don't break the split
      let rest = v;
      const color = rest.match(COLOR_TOKEN_PATTERN);
      if (color) {
        emit('color', color[1]);
        rest = rest.replace(color[1], ' ');
      }
      for (const part of rest.split(/\s+/).filter(Boolean)) {
        if (/^(\d|\.)/.test(part)) {
          emit('width', part);
        } else if (/^(solid|dashed|dotted|double|none|hidden)$/.test(part)) {
          emit('style', part);
        } else {
          emit('color', part);
        }
      }
      return out;
    }
    case 'border-width':
    case 'border-style':
    case 'border-color': {
      const kind = prop.slice(7);
      const box = expandBoxShorthand(v);
      return SIDES.map((side, i) => [`border-${side}-${kind}`, box[i]] as [string, string]);
    }
    case 'outline': {
      if (v === 'none') {
        return [['outline-style', 'none']];
      }
      const out: [string, string][] = [];
      let rest = v;
      const color = rest.match(COLOR_TOKEN_PATTERN);
      if (color) {
        out.push(['outline-color', color[1]]);
        rest = rest.replace(color[1], ' ');
      }
      for (const part of rest.split(/\s+/).filter(Boolean)) {
        if (/^(\d|\.)/.test(part)) {
          out.push(['outline-width', part]);
        } else if (/^(solid|dashed|dotted|double|none|auto)$/.test(part)) {
          out.push(['outline-style', part]);
        } else {
          out.push(['outline-color', part]);
        }
      }
      return out;
    }
    case 'background':
      return COLOR_VALUE_PATTERN.test(v) ? [['background-color', v]] : [[prop, v]];
    case 'list-style':
      return v === 'none' ? [['list-style-type', 'none']] : [[prop, v]];
    case 'gap': {
      const parts = splitOutsideParentheses(v);
      return [
        ['row-gap', parts[0]],
        ['column-gap', parts[1] ?? parts[0]],
      ];
    }
    case 'transform': {
      const rotate = v.match(/^rotate\(([^)]+)\)$/);
      if (rotate) {
        return [['rotate', rotate[1]]];
      }
      const translateY = v.match(/^translateY\(([^)]+)\)$/);
      if (translateY) {
        return [['translate', `0 ${translateY[1]}`]];
      }
      const translateX = v.match(/^translateX\(([^)]+)\)$/);
      if (translateX) {
        return [['translate', `${translateX[1]} 0`]];
      }
      return [[prop, v]];
    }
    case 'translate': {
      const parts = splitOutsideParentheses(v);
      return [['translate', parts.length === 1 ? `${parts[0]} 0` : v]];
    }
    case 'opacity': {
      const pct = v.match(/^(\d*\.?\d+)%$/);
      return [[prop, pct ? String(Number(pct[1]) / 100) : v]];
    }
    default:
      return [[prop, v]];
  }
}

function normaliseCssSelector(selector: string): string {
  return selector
    .replace(/'/g, '"')
    .replace(/(^|[^:]):(before|after|placeholder|selection)\b/g, '$1::$2')
    .replace(/\s*([>+~])\s*/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Build the canonical map: `[media ::] selector :: prop` -> canonical value. */
export function canonicaliseCssDeclarations(entries: ParsedCssEntry[]): Map<string, string> {
  const map = new Map<string, string>();
  const push = (selector: string, prop: string, value: string, media: string | null): void => {
    for (const [longhand, val] of expandToPhysicalLonghands(prop, value)) {
      const key = `${media ? `@media ${media} :: ` : ''}${normaliseCssSelector(selector)} :: ${longhand}`;
      map.set(key, normaliseCssValue(val));
    }
  };
  for (const entry of entries) {
    if (entry.kind === 'rule') {
      for (const decl of entry.decls) {
        push(entry.selector, decl.prop, decl.value, null);
      }
    } else if (entry.kind === 'media') {
      for (const rule of entry.rules) {
        for (const decl of rule.decls) {
          push(rule.selector, decl.prop, decl.value, entry.params);
        }
      }
    }
  }
  return map;
}

export interface CssParityMismatch {
  key: string;
  expected: string;
  got: string | undefined;
}

export interface CssParityResult {
  /** Declarations of the hand-written CSS missing or wrong in the derived CSS. */
  mismatches: CssParityMismatch[];
  /** Declarations the derived CSS introduces that the hand-written CSS never set. */
  extras: { key: string; value: string }[];
  total: number;
}

/** Compare hand-written CSS against derived CSS, both in canonical form. */
export function diffCssParity(
  hand: Map<string, string>,
  derived: Map<string, string>,
): CssParityResult {
  const mismatches: CssParityMismatch[] = [];
  const extras: { key: string; value: string }[] = [];
  for (const [key, expected] of hand) {
    const got = derived.get(key);
    if (got !== expected) {
      mismatches.push({ key, expected, got });
    }
  }
  for (const [key, value] of derived) {
    if (!hand.has(key)) {
      extras.push({ key, value });
    }
  }
  return { mismatches, extras, total: hand.size };
}
