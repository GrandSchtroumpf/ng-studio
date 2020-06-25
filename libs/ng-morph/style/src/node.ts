import { Node, stringify, parse } from 'scss-parser';

const types = [
  'stylesheet',
  'rule',
  'selector', 'identifier', 'class', 'id',
  'block',
  'declaration', 'property', 'value',
] as const;

type StyleType = typeof types[number];

export interface Rule {
  rules: Rule[];
  selector: Selector;
  declarations: Record<string, string>;
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
  
  getRule(selector: string) {
    return this.record[selector];
  }

  print() {
    return this.ast.map(rule => printRule(rule, 1)).join('\n\n');
  }
}

/** Create the rule node */
function createRule(node: Node, ctxSelector: string) {
  const rule = { selector: null, rules: null, declarations: null };
  const [[selector], [block]] = getChildren(node, ['selector', 'block']);
  const [declarations, rules] = getChildren(block, ['declaration', 'rule']);
  rule.selector = createSelector(selector, ctxSelector);
  rule.rules = rules.map(r => createRule(r, this.selector.id));

  for (const declaration of declarations) {
    const [[property], [value]] = getChildren(declaration, ['property', 'value']);
    const propertyStr = stringify(property).trim();
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
  const block = Object.entries(this.declarations).map(([property, value]) => `${property}: ${value};`).join('\n' + tabs);
  const rules = rule.rules.map(r => printRule(r, depth+1)).join('\n\n' + tabs);
  const innerBlock = [ block, rules ].filter(v => !!v).join('\n\n' + tabs);
  return `${selector} {\n${tabs}${innerBlock}\n${tabsEnd}}`;
}
