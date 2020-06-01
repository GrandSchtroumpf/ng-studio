import { parseTemplate } from '@angular/compiler';
import { isElementNode, createAst, HtmlNode, createId, getParentAndIndex, elementNode } from './node';


/////////////
// ELEMENT //
/////////////

export interface ElementNode {
  id: string;
  name: string;
  template?: TemplateNode;
  attributes: AttributeNode[];
  inputs: AttributeNode[];
  outputs: AttributeNode[];
  children: HtmlNode[];
  references: AttributeNode[];
}

export interface AttributeNode {
  name: string;
  value: string;
}

export interface TemplateNode {
  tagName: string;
  variables: AttributeNode[];
  templateAttrs: AttributeNode[];
}


class Element {
  public node: ElementNode;

  constructor(node: Partial<ElementNode> = {}) {
    this.node = elementNode(node);
  }

  get(key: keyof ElementNode) {
    return this.node[key];
  }

  addAttribute() {}
  removeAttribute() {}

  addInput() {}
  removeInput() {}

  addChild() {}
}


///////////////////
//  TEMPLATE AST //
///////////////////
interface AstTree {
  nodes: HtmlNode[];
  styles: string[];
  ngContentSelectors: string[];
  errors?: string[],
}

export function getTemplateAst(template: string) {
  const { nodes, errors } = parseTemplate(template, '');
  if (!errors) {
    const templateAst = new TemplateAst();
    const ast = createAst(nodes);
    templateAst.visitAll(ast);
    return templateAst;
  }
}

export class TemplateAst {
  private tree: AstTree = { nodes: [], styles: [], ngContentSelectors: [] };
  private map: Record<string, HtmlNode> = {};

  constructor() {}

  getNode<T extends HtmlNode = HtmlNode>(id: string): T {
    return this.map[id] as T;
  }

  getAst() {
    return this.tree;
  }

  print() {
    return '';
  }

  visitAll(ast: HtmlNode[]) {
    this.tree.nodes = ast;
    ast.forEach(node => this.visitNode(node));
  }

  private visitNode(node: HtmlNode) {
    this.map[node.id] = node;
    if (isElementNode(node)) {
      node.children.forEach(child => this.visitNode(child));
    }
  }

  private forget(node: HtmlNode) {
    if (isElementNode(node)) {
      node.children.forEach(child => this.forget(child));
    }
    delete this.map[node.id];
  }

  private updateId(node: HtmlNode, newId: string) {
    this.forget(node);
    node.id = newId;
    if (isElementNode(node)) {
      node.children.forEach((child, i) => this.updateId(child, createId(newId, i)));
    }
    this.map[node.id] = node;
  }

  getChildren(parentId?: string) {
    return parentId
      ? this.getNode<ElementNode>(parentId)?.children
      : this.tree.nodes;
  }

  get(id: string) {
    const node = this.map[id];
    if (isElementNode(node)) {
      return new Element(node);
    }
  }

  push(node: HtmlNode, parentId?: string) {
    const children = this.getChildren(parentId);
    if (children) {
      node.id = createId(parentId, children.length);
      this.visitNode(node);
      return children.push(node);
    }
  }

  insert(node: HtmlNode, index: number, parentId: string) {
    const children = this.getChildren(parentId);
    if (children) {
      const size = children.length;  // Need to store it because it grows inside the loop
      if (index > size) {
        index = size;
      }
      if (index < 0) {
        index = 0;
      }
      // Move all current nodes
      for (let i = index; i < size; i++) {
        this.updateId(children[i], createId(parentId, i + 1));
        children[i + 1] = children[i];
      }
      // Add the new one
      node.id = createId(parentId, index);
      this.visitNode(node);
      children[index] = node;
    }
  }

  pop<T extends HtmlNode = HtmlNode>(parentId?: string): T {
    const children = this.getChildren(parentId);
    if (children) {
      const child = children.pop();
      this.forget(child);
      return child as T;
    }
  }

  remove<T extends HtmlNode = HtmlNode>(index: number, parentId?: string): T {
    const children = this.getChildren(parentId);
    if (children) {
      const size = children.length;  // Need to store it because it grows inside the loop
      if (index > size - 1) {
        index = size - 1;
      }
      if (index < 0) {
        index = 0;
      }
      const child = children[index];
      // Move all next node to the previous one & remove the last
      for (let i = index + 1; i < size; i++) {
        this.updateId(children[i], createId(parentId, i - 1));
        children[i - 1] = children[i];
      }
      // Remove last element (duplicate of the previous one)
      const last = children.pop();
      this.forget(last);
      return child as T;
    }
  }

  move(fromId: string, toId: string) {
    const node = this.map[fromId];
    const [ fromParentId, i ] = getParentAndIndex(fromId);
    const [ toParentId, index ] = getParentAndIndex(toId);
    const parent = this.map[toParentId];
    if (node && (parent || toParentId === '')) {
      this.remove(i, fromParentId);
      this.insert(node, index, toParentId);
    }
  }

  update(id: string, updates: Partial<HtmlNode>) {
    const node = this.map[id];
    delete updates['children']; // Remove children if any
    for (const key in updates) {
      node[key] = updates[key];
    }
  }
}