import postcss, { AtRule, Rule } from 'postcss';

export interface CssDeclaration {
  prop: string;
  value: string;
}

export interface CssRuleEntry {
  kind: 'rule';
  selector: string;
  decls: CssDeclaration[];
}

export interface CssMediaEntry {
  kind: 'media';
  params: string;
  rules: { selector: string; decls: CssDeclaration[] }[];
}

export interface CssKeyframesEntry {
  kind: 'keyframes';
  name: string;
  css: string;
}

export type ParsedCssEntry = CssRuleEntry | CssMediaEntry | CssKeyframesEntry;

/**
 * Extract the `styles` template literal from a component source file.
 * Returns null when the component has no styles block.
 */
export function extractComponentStyles(source: string): string | null {
  const match = source.match(
    /styles:\s*`([\s\S]*?)`\s*,?\s*\n\s*(?:host|template|imports|providers|changeDetection|animations|encapsulation|\}\))/,
  );
  return match ? match[1] : null;
}

/**
 * Parse component CSS into an ordered entry list, flattening `&` nesting onto
 * the parent selector so every rule carries a complete, standalone selector.
 * Source order is preserved — the cascade between equal-specificity rules
 * depends on it.
 */
export function parseCssRules(css: string): ParsedCssEntry[] {
  const root = postcss.parse(css);
  const entries: ParsedCssEntry[] = [];

  const declarationsOf = (node: Rule | AtRule): CssDeclaration[] => {
    const declarations: CssDeclaration[] = [];
    node.each(child => {
      if (child.type === 'decl') {
        declarations.push({ prop: child.prop, value: child.value });
      }
    });
    return declarations;
  };

  const walkRule = (rule: Rule, parentSelector: string | null, sink: ParsedCssEntry[]): void => {
    for (const rawSelector of rule.selectors) {
      const selector = (
        parentSelector ? rawSelector.replace(/&/g, parentSelector) : rawSelector
      ).trim();
      const declarations = declarationsOf(rule);
      if (declarations.length) {
        sink.push({ kind: 'rule', selector, decls: declarations });
      }
      rule.each(child => {
        if (child.type === 'rule') {
          walkRule(child, selector, sink);
        } else if (child.type === 'atrule' && child.name === 'media') {
          const inner = declarationsOf(child);
          if (inner.length) {
            sink.push({ kind: 'media', params: child.params, rules: [{ selector, decls: inner }] });
          }
          child.each(grandchild => {
            if (grandchild.type === 'rule') {
              walkRule(grandchild, selector, sink);
            }
          });
        }
      });
    }
  };

  root.each(node => {
    if (node.type === 'rule') {
      walkRule(node, null, entries);
    } else if (node.type === 'atrule' && node.name === 'keyframes') {
      entries.push({ kind: 'keyframes', name: node.params, css: node.toString() });
    } else if (node.type === 'atrule' && node.name === 'media') {
      const inner: ParsedCssEntry[] = [];
      node.each(child => {
        if (child.type === 'rule') {
          walkRule(child, null, inner);
        }
      });
      const rules = inner.filter((entry): entry is CssRuleEntry => entry.kind === 'rule');
      if (rules.length) {
        entries.push({ kind: 'media', params: node.params, rules });
      }
    }
  });

  return entries;
}
