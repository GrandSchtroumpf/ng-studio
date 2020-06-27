import { Node, stringify, parse } from 'scss-parser';
import { TagNode } from 'ng-morph/template';

const types = [
  'stylesheet',
  'rule',
  'selector', 'identifier', 'class', 'id',
  'block',
  'declaration', 'property', 'value',
] as const;

type StyleType = typeof types[number];

export function getSelectorTag(tag: TagNode): SelectorTag {
  return {
    tag: tag.name,
    classes: tag.attributes.find(attr => attr.name === 'class')?.value.split(' ') || [],
    ids: tag.attributes.find(attr => attr.name === 'id')?.value.split(' ') || [],
  }
}
export interface SelectorTag {
  tag: string;
  classes: string[];
  ids: string[];
}

export interface Rule {
  rules: Rule[];
  selector: Selector;
  declarations: Partial<CSSStyleDeclaration>;
}

export interface Selector {
  id: string;
  value: string;
}

function getChildren(node: Node, keys: StyleType[]): Node[][] {
  const values = new Array(keys.length).fill(undefined).map(v => []);
  for (const child of node.value) {
    if (typeof child !== 'string') {
      const index = keys.indexOf(child.type as StyleType);
      if (index > -1) {
        values[index].push(child);
      }
    }
  }
  return values;
}

export function parseStyle(style: string) {
  const css = parse(style);
  return new StylesheetHost(css);
}

export function getSelector(parent: string, selector: Node) {
  return `${parent} ${stringify(selector)}`.trim()
}

export const toCamelCase = s => s.replace(/-./g, x => x.toUpperCase()[1])

export class StylesheetHost {
  private ast: Rule[];
  private record: Record<string, Rule> = {};
  
  constructor(public node: Node) {
    const [rules] = getChildren(node, ['rule']);
    this.ast = rules.map(r => createRule(r, ''));
    this.ast.forEach(rule => this.visitRule(rule))
  }

  private visitRule(rule: Rule) {
    this.record[rule.selector.id] = rule;
    rule.rules.forEach(r => this.visitRule(r));
  }
  
  getAst() {
    return this.ast;
  }

  getSelectors(selectorTag: SelectorTag) {
    return Object.keys(this.record)
      .filter(selector => {
        const value = selector.split(' ').pop();
        const hasClass = selectorTag.classes.some(className => value.includes(`.${className}`));
        const hasId = selectorTag.ids.some(idName => value.includes(`#${idName}`));
        const hasTag = value.includes(selectorTag.tag);
        return (hasClass || hasId || hasTag);
      });
  }

  getRule(selector: string) {
    return this.record[selector];
  }

  update(rule: Rule) {
    const { selector, declarations } = rule;
    const node = this.record[selector.id];
    for (const property in declarations) {
      node.declarations[property] = declarations[property];
    }
  }

  print() {
    return this.ast.map(rule => printRule(rule, 1)).join('\n\n');
  }
}

/** Create the rule node */
function createRule(node: Node, ctxSelector: string): Rule {
  const rule = { selector: null, rules: null, declarations: {} };
  const [[selector], [block]] = getChildren(node, ['selector', 'block']);
  const [declarations, rules] = getChildren(block, ['declaration', 'rule']);
  rule.selector = createSelector(selector, ctxSelector);
  rule.rules = rules.map(r => createRule(r, rule.selector.id));

  for (const declaration of declarations) {
    const [[property], [value]] = getChildren(declaration, ['property', 'value']);
    const propertyStr = toCamelCase(stringify(property).trim());
    const valueStr = stringify(value).trim();
    rule.declarations[propertyStr] = valueStr;
  }
  return rule;
}

/** Create a selector */
function createSelector(node: Node, ctxSelector: string) {
  const value = stringify(node).trim();
  return { id: `${ctxSelector} ${value}`.trim(), value };
}

/** Print a rule */
function printRule(rule: Rule, depth: number) {
  const tabs = '\t'.repeat(depth);
  const tabsEnd = '\t'.repeat(depth - 1);
  const selector = rule.selector.value;
  const block = Object.entries(rule.declarations).map(([property, value]) => `${property}: ${value};`).join('\n' + tabs);
  const rules = rule.rules.map(r => printRule(r, depth+1)).join('\n\n' + tabs);
  const innerBlock = [ block, rules ].filter(v => !!v).join('\n\n' + tabs);
  return `${selector} {\n${tabs}${innerBlock}\n${tabsEnd}}`;
}
