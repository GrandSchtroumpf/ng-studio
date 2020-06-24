import { Node, stringify, parse } from 'scss-parser';

const types = [
  'stylesheet',
  'rule',
  'selector', 'identifier', 'class', 'id',
  'block',
  'declaration', 'property', 'value',
] as const;

type StyleType = typeof types[number];

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
  private rules: Rule[];
  private record: Record<string, Rule> = {};
  
  constructor(public node: Node) {
    const [rules] = getChildren(node, ['rule']);
    this.rules = rules.map(r => new Rule(r, ''));
    this.rules.forEach(rule => this.visitRule(rule))
  }

  getRule(selector: string) {
    return this.record[selector];
  }

  visitRule(rule: Rule) {
    this.record[rule.selector.id] = rule;
    rule.rules.forEach(r => this.visitRule(r));
  }

  print() {
    return this.rules.map(rule => rule.print(1)).join('\n\n');
  }
}

export class Rule {
  selector: Selector;
  declarations: Record<string, string> = {};
  rules: Rule[];  // Child rules

  constructor(node: Node, ctxSelector: string) {
    const [[selector], [block]] = getChildren(node, ['selector', 'block']);
    const [declarations, rules] = getChildren(block, ['declaration', 'rule']);
    this.selector = new Selector(selector, ctxSelector);
    this.rules = rules.map(r => new Rule(r, this.selector.id));
  
    for (const declaration of declarations) {
      const [[property], [value]] = getChildren(declaration, ['property', 'value']);
      const propertyStr = stringify(property).trim();
      const valueStr = stringify(value).trim();
      this.declarations[propertyStr] = valueStr;
    }
  }

  print(depth: number) {
    const tabs = '\t'.repeat(depth);
    const tabsEnd = '\t'.repeat(depth - 1);
    const selector = this.selector.print();
    const block = Object.entries(this.declarations).map(([property, value]) => `${property}: ${value};`).join('\n' + tabs);
    const rules = this.rules.map(rule => rule.print(depth+1)).join('\n\n' + tabs);
    const innerBlock = [block, rules].filter(v => !!v).join('\n\n' + tabs);
    return `${selector} {\n${tabs}${innerBlock}\n${tabsEnd}}`;
  }
}

export class Selector {
  id: string;
  value: string;
  constructor(node: Node, public ctxSelector: string) {
    this.value = stringify(node).trim();
    this.id = `${this.ctxSelector} ${this.value}`.trim();
  }

  print() {
    return this.value;
  }
}
