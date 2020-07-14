import { parseTemplate } from '@angular/compiler';
import {
  createAst, HtmlNode, createId, getParentAndIndex,
  isElementNode, ElementNode, elementNode,
  isContentNode, ContentNode, contentNode,
  isTextNode, TextNode,
  TemplateNode,
  ngTemplateNode,
} from './node';
import { printNode } from './print';


/////////
// TAG //
/////////


type AttributeType = 'attributes' | 'inputs' | 'outputs' | 'references';

class Tag {
  protected node: ElementNode;
  protected host: TemplateHost;
  public addTextAttribute = this.addAttribute.bind(this, 'attributes');
  public removeTextAttribute = this.removeAttribute.bind(this, 'attributes');
  
  public addInput = this.addAttribute.bind(this, 'inputs');
  public removeInput = this.removeAttribute.bind(this, 'inputs');

  public addOuput = this.addAttribute.bind(this, 'outputs');
  public removeOutput = this.removeAttribute.bind(this, 'outputs');

  public addReference = this.addAttribute.bind(this, 'references');
  public removeReference = this.removeAttribute.bind(this, 'references');


  protected addAttribute(type: AttributeType, name: string, value: string = '') {
    this.get(type).push({ name, value });
  }

  protected removeAttribute(type: AttributeType, name: string) {
    const attributes = this.get(type);
    const index = attributes.findIndex(attr => attr.name === name);
    return attributes.splice(index, 1);
  }

  setHost(host: TemplateHost) {
    this.host = host;
  }

  update(node: Partial<ElementNode>) {
    return this.host.update(node, this.node.id);
  }
  // todo : addElement / addText / addContent

  push<T extends HtmlNode>(node: T) {
    return this.host.push(node, this.node.id);
  }

  insert(node: HtmlNode, index: number) {
    return this.host.insert(node, index, this.node.id);
  }

  pop() {
    return this.host.pop(this.node.id);
  }

  removeAt(index: number) {
    return this.host.removeAt(index, this.node.id);
  }

  get<K extends keyof ElementNode>(key: K): ElementNode[K] {
    return this.node[key];
  }

  getNode() {
    return this.node;
  }

  getChildren() {
    return this.node.children.map(node => this.host.get(node.id));
  }
}

/////////////
// ELEMENT //
/////////////

export class Element extends Tag {
  static fromHost(host: TemplateHost, node?: Partial<ElementNode>) {
    const element = new Element(node);
    element.setHost(host);
    return element;
  }

  static fromName(name: string) {
    return new Element({ name });
  }

  static fromTemplate(template: string) {
    const host = getTemplateHost(template);
    const children = host.getChildren();
    if (children.length > 1) {
      throw new Error('Element template must have one element root');
    }
    const element = new Element(children[0]);
    element.setHost(host);
    return element;
  }
  
  constructor(node: Partial<ElementNode> = {}) {
    super();
    this.node = elementNode(node);
    const host = new TemplateHost();
    host.visitAll([ this.node ]);
    this.setHost(host);
  }

  getTemplate() {
    if (this.node.template) {
      return new Template(this.node.template);
    }
  }

  setTemplate(node: TemplateNode) {
    this.node.template = node;
  }
}

//////////////
// TEMPLATE //
//////////////


type TemplateAttributeType = 'variables' | 'templateAttrs';

export class Template {
  public addVariable = this.addAttribute.bind(this, 'variables');
  public removeVariable = this.removeAttribute.bind(this, 'variables');

  public addTemplateAttr = this.addAttribute.bind(this, 'templateAttrs');
  public removeTemplateAttr = this.removeAttribute.bind(this, 'templateAttrs');

  constructor(private node: TemplateNode) {}

  private addAttribute(type: TemplateAttributeType, name: string, value: string = '') {
    this.get(type).push({ name, value });
  }

  private removeAttribute(type: TemplateAttributeType, name: string) {
    const attributes = this.get(type);
    const index = attributes.findIndex(attr => attr.name === name);
    return attributes.splice(index, 1);
  }

  get<K extends keyof TemplateNode>(key: K): TemplateNode[K] {
    return this.node[key];
  }
}

export class NgTemplate extends Tag {
  public addVariable = super.addAttribute.bind(this, 'variables');
  public removeVariable = super.removeAttribute.bind(this, 'variables');

  static fromHost(host: TemplateHost, node?: Partial<ElementNode>) {
    const element = new Element(node);
    element.setHost(host);
    return element;
  }

  static fromTemplate(template: string) {
    const host = getTemplateHost(template);
    const children = host.getChildren();
    if (children.length > 1) {
      throw new Error('Element template must have one element root');
    }
    const element = new Element(children[0]);
    element.setHost(host);
    return element;
  }

  constructor(node: Partial<ElementNode> = {}) {
    super();
    this.node = ngTemplateNode(node);
    const host = new TemplateHost();
    host.visitAll([ this.node ]);
    this.setHost(host);
  }
}

/////////////
// CONTENT //
/////////////
export class Content {
  private node: ContentNode;
  constructor(node: Partial<ContentNode> = {}) {
    this.node = contentNode(node);
  }

  get<K extends keyof ContentNode>(key: K): ContentNode[K] {
    return this.node[key];
  }

  setSelector(selector: string) {
    this.node.selector = selector;
  }

  getNode() {
    return this.node;
  }
}

//////////
// TEXT //
//////////
export class Text {
  private node: TextNode;
  constructor(node: Partial<ContentNode> = {}) {
    this.node = { id: '', value: '', ...node };
  }

  setText(text: string) {
    this.node.value = text;
  }
}





////////////////////
//  TEMPLATE HOST //
////////////////////
interface AstTree {
  nodes: HtmlNode[];
  styles: string[];
  ngContentSelectors: string[];
  errors?: string[],
}

export function getTemplateHost(template: string) {
  const { nodes, errors } = parseTemplate(template, '');
  if (!errors) {
    const host = new TemplateHost();
    const ast = createAst(nodes);
    host.visitAll(ast);
    return host;
  }
}

export function removePrefixId(node: HtmlNode, prefix: string) {
  node.id = node.id.replace(prefix, '');
  if (isElementNode(node)) {
    node.children.forEach(child => removePrefixId(child, prefix));
  }
}

export class TemplateHost {
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
    return this.tree.nodes.map(node => printNode(node)).join('\n');
  }

  visitAll(ast: HtmlNode[]) {
    this.tree.nodes = ast;
    ast.forEach((node, i) => this.visitNode(node, createId(i)));
  }

  private visitNode(node: HtmlNode, id: string) {
    node.id = node.id || id;
    this.map[node.id] = node;
    if (isElementNode(node)) {
      node.children.forEach((child, i) => this.visitNode(child, createId(node.id, i)));
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

  /**
   * Attach an element to another host
   * @param element The element to attach the the current host
   * @param parentId The id of the parent to add the element into
   * @param index The index inside the parent
   */
  attach(element: Element, parentId?: string, index?: number) {
    const children = this.getChildren(parentId);
    if (children) {
      const node = element.getNode();
      this.insert(node, index || children.length, parentId);
      element.setHost(this);
    }
  }

  /** Detach an element from this host and attach it to it's own */
  detach(id: string) {
    const [ parentId, index ] = getParentAndIndex(id);
    const node = this.removeAt(index, parentId);
    removePrefixId(node, parentId);
    return new Element(node);
  }

  getChildren(parentId?: string) {
    return parentId
      ? this.getNode<ElementNode>(parentId)?.children
      : this.tree.nodes;
  }

  get(id: string) {
    const node = this.map[id];
    if (isElementNode(node)) {
      return Element.fromHost(this, node);
    }
    if (isContentNode(node)) {
      return new Content(node);
    }
    if (isTextNode(node)) {
      return new Text(node);
    }
  }

  push(node: HtmlNode, parentId?: string) {
    const children = this.getChildren(parentId);
    if (children) {
      const id = createId(parentId, children.length);
      this.visitNode(node, id);
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
      const id = createId(parentId, index);
      this.visitNode(node, id);
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

  /** Remove a node at a precise id */
  delete(id: string) {
    const [ parentId, index ] = getParentAndIndex(id);
    return this.removeAt(index, parentId);
  }

  removeAt<T extends HtmlNode = HtmlNode>(index: number, parentId?: string): T {
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
      this.removeAt(i, fromParentId);
      this.insert(node, index, toParentId);
    }
  }

  update(updates: Partial<HtmlNode>, id: string) {
    const node = this.map[id];
    delete updates['id'];       // Remove id if any
    for (const key in updates) {
      if (key === 'children') {
        updates[key].forEach(child => this.update(child, child.id));
      } else {
        node[key] = updates[key];
      }
    }
  }
}