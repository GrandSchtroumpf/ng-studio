// Create connection between AST & HTML Node
import { Element, Node, BoundAttribute, TextAttribute, BoundEvent, Reference, Template, Variable, Content, Text, BoundText } from "@angular/compiler/src/render3/r3_ast";
import { isElement, isTemplate, isContent, isText, isBoundText } from './helpers';
import { ASTWithSource, parseTemplate } from '@angular/compiler';

export type HtmlNode = ElementNode | ContentNode | TextNode;

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

export interface ContentNode {
  id: string;
  selector: string;
  attributes: AttributeNode[];
}

export interface TextNode {
  id: string;
  value: string;
}


export function isElementNode(node: HtmlNode): node is ElementNode {
  return 'id' in node && 'children' in node && 'name' in node;
}

export function isContentNode(node: HtmlNode): node is ContentNode {
  return 'id' in node && 'select' in node;
}

export function isTextNode(node: HtmlNode): node is TextNode {
  return 'id' in node && 'value' in node;
}


export function createAst(nodes: Node[]) {
  return nodes.map((node, i) => fromNode(node, `${i}`));
}

export function fromNode(node: Node, id: string) {
  if (isElement(node)) {
    return fromElement(node, id);
  }
  if (isText(node)) {
    return fromText(node, id);
  }
  if (isBoundText(node)) {
    return fromBoundText(node, id);
  }
  if (isTemplate(node)) {
    return fromTemplate(node, id);
  }
  if (isContent(node)) {
    return fromContent(node, id);
  }
}

//////////////////
// ELEMENT NODE //
//////////////////


export function fromElement(node: Element, parentId: string) {
  const id = createId(parentId, node.name);
  return {
    id,
    name: node.name,
    attributes: node.attributes.map(attr => fromTextAttribute(attr)),
    inputs: node.inputs.map(attr => fromInput(attr)),
    outputs: node.outputs.map(attr => fromOutput(attr)),
    references: node.references.map(attr => fromReference(attr)),
    children: node.children.map((child, i) => fromNode(child, `${id}_${i}`)),
  }
}

export function fromTemplate(node: Template, parentId: string) {
  return node.tagName === 'ng-template'
    ? fromNgTemplate(node, parentId)
    : fromStructuralDirective(node, parentId)
}

/** Match with Element Node */
export function fromNgTemplate(node: Template, parentId: string): ElementNode {
  const id = createId(parentId, node.tagName);
  return {
    id,
    name: node.tagName,
    attributes: node.attributes.map(attr => fromTextAttribute(attr)),
    inputs: node.inputs.map(attr => fromInput(attr)),
    outputs: node.outputs.map(attr => fromOutput(attr)),
    references: node.references.map(attr => fromReference(attr)),
    children: node.children.map((child, i) => fromNode(child, `${id}_${i}`))
  }
}

/** Add template attribute the the child element */
export function fromStructuralDirective(node: Template, parentId: string): ElementNode {
  const child = fromNode(node.children[0], parentId);
  const template = {
    tagName: node.tagName,
    variables: node.variables.map(v => fromVariable(v)),
    templateAttrs: node.templateAttrs.map(tmpAttr => {
      return typeof tmpAttr.value === 'string'
        ? fromTextAttribute(tmpAttr as TextAttribute)
        : fromInput(tmpAttr as BoundAttribute)
    })
  }
  child.template = template;
  return child;
}


export function fromContent(node: Content, parentId: string) {
  return {
    id: createId(parentId, node.selector),
    selector: node.selector,
    attributes: node.attributes.map(attr => fromTextAttribute(attr))
  }
}

////////////////
// ATTRIBUTES //
////////////////

export function fromTextAttribute(node: TextAttribute): AttributeNode {
  return {
    name: node.name,
    value: node.value
  }
}

export function fromInput(node: BoundAttribute): AttributeNode {
  return {
    name: node.name,
    value: (node.value as ASTWithSource).source
  }
}

export function fromOutput(node: BoundEvent): AttributeNode {
  return {
    name: node.name,
    value: (node.handler as ASTWithSource).source
  }
}

export function fromReference(node: Reference): AttributeNode {
  return {
    name: node.name,
    value: node.value
  }
}

export function fromVariable(node: Variable): AttributeNode {
  return {
    name: node.name,
    value: node.value
  }
}


//////////
// TEXT //
//////////

export function fromText(node: Text, parentId: string): TextNode {
  return {
    id: createId(parentId, 'text'),
    value: node.value
  }
}

export function fromBoundText(node: BoundText, parentId: string): TextNode {
  return {
    id: createId(parentId, 'boundText'),
    value: (node.value as ASTWithSource).source
  }
}

// TODO : ICU

function createId(parentId: string, baseId: string) {
  return parentId ? `${parentId}-${baseId}` : baseId;
}


function childId(parentId: string, index: number) {
  return parentId ? `${parentId}_${index}` : `${index}`;
}

function getParentAndIndex(nodeId: string): [ string, number ] {
  const shard = nodeId.split('_');
  const lastId = shard.pop();
  const parentId = shard.join('_');
  const index = parseInt(lastId.split('-').shift(), 10);
  return [ parentId, index ];
}



/////////////
// VISITOR //
/////////////

type NodeLike = Node | HtmlNode;
function isHtmlNode(node: NodeLike): node is HtmlNode {
  return 'id' in node;
}


export function createMorphTemplate(template: string) {
  const { nodes, errors } = parseTemplate(template, '');
  if (!errors) {
    const morph = new MorphTemplate();
    morph.loadAst(nodes);
    return morph;
  }
}

export class MorphTemplate  {
  ast: { nodes: HtmlNode[] } = { nodes: [] };
  mapping: Record<string, HtmlNode> = {};

  loadAst(nodes: Node[]) {
    this.ast.nodes = nodes.map((node, i) => this.visit(node, `${i}`));
  }

  /** Remove trace of the node in the mapping */
  private forget(node: HtmlNode) {
    if (isElementNode(node)) {
      node.children.forEach(child => this.forget(child));
    }
    delete this.mapping[node.id];
  }

  private visit(node: NodeLike, id: string): HtmlNode {
    let value: HtmlNode;
    if (isHtmlNode(node)) {
      if (isElementNode(node)) {
        value = this.visitElementNode(node, id);
      }
      if (isContentNode(node)) {
        value = this.visitContentNode(node, id);
      }
      if (isTextNode(node)) {
        value = this.visitTextNode(node, id);
      }
    } else {
      if (isElement(node)) {
        value = this.visitElement(node, id);
      }
      if (isTemplate(node)) {
        value = this.visitTemplate(node, id);
      }
      if (isText(node)) {
        value = fromText(node, id);
      }
      if (isBoundText(node)) {
        value = fromBoundText(node, id);
      }
      if (isContent(node)) {
        value = fromContent(node, id);
      }
    }
    this.mapping[value.id] = value;
    return value;
  }

  private visitElementNode(node: ElementNode, parentId: string) {
    const id = createId(parentId, node.name);
    node.id = id;
    return node;
  }

  private visitContentNode(node: ContentNode, parentId: string) {
    const id = createId(parentId, 'ng-content');
    node.id = id;
    return node;
  }

  private visitTextNode(node: TextNode, parentId: string) {
    const id = createId(parentId, 'text');
    node.id = id;
    return node;
  }

  private visitElement(node: Element, parentId: string) {
    const id = createId(parentId, node.name);
    return {
      id,
      name: node.name,
      attributes: node.attributes.map(attr => fromTextAttribute(attr)),
      inputs: node.inputs.map(attr => fromInput(attr)),
      outputs: node.outputs.map(attr => fromOutput(attr)),
      references: node.references.map(attr => fromReference(attr)),
      children: node.children.map((child, i) => this.visit(child, `${id}_${i}`)),
    }
  }

  private visitTemplate(node: Template, parentId: string) {
    return node.tagName === 'ng-template'
      ? this.visitNgTemplate(node, parentId)
      : this.visitStructuralDirective(node, parentId)
  }

  private visitNgTemplate(node: Template, parentId: string) {
    const id = createId(parentId, node.tagName);
    return {
      id,
      name: node.tagName,
      attributes: node.attributes.map(attr => fromTextAttribute(attr)),
      inputs: node.inputs.map(attr => fromInput(attr)),
      outputs: node.outputs.map(attr => fromOutput(attr)),
      references: node.references.map(attr => fromReference(attr)),
      children: node.children.map((child, i) => this.visit(child, `${id}_${i}`))
    }
  }

  private visitStructuralDirective(node: Template, parentId: string) {
    const child = this.visit(node.children[0], parentId);
    // You shouldn't be able to apply structural directive on text
    if (isElementNode(child)) {
      const template = {
        tagName: node.tagName,
        variables: node.variables.map(v => fromVariable(v)),
        templateAttrs: node.templateAttrs.map(tmpAttr => {
          return typeof tmpAttr.value === 'string'
            ? fromTextAttribute(tmpAttr as TextAttribute)
            : fromInput(tmpAttr as BoundAttribute);
        })
      };
      child.template = template;
      return child;
    }
  }


  push(parentId: string, node: NodeLike) {
    const parent = this.mapping[parentId];
    if (isElementNode(parent)) {
      const i = parent.children.length;
      const htmlNode = this.visit(node, `${parentId}_${i}`);
      parent.children.push(htmlNode);
    }
  }

  insert(parentId: string, node: NodeLike, index: number) {
    const parent = this.mapping[parentId];
    if (parent && isElementNode(parent)) {
      if (index < parent.children.length) {
        for (let i = index; i < parent.children.length; i++) {
          this.forget(parent.children[i]);  // forget all old node references (not needed if name is removed from id)
          parent.children[i+1] = this.visit(parent.children[i], childId(parentId, i + 1));
        }
        parent.children[index] = this.visit(node, childId(parentId, index));
      } else {
        this.push(parentId, node);
      }
    }
  }

  pop(parentId: string) {
    const parent = this.mapping[parentId];
    if (parent && isElementNode(parent)) {
      const child = parent.children.shift();
      this.forget(child);
    }
  }

  remove(parentId: string, index: number) {
    const parent = this.mapping[parentId];
    if (parent && isElementNode(parent)) {
      if (index < parent.children.length - 1) {
        // Move all next node to the previous one & remove the last
        for (let i = index + 1; i < parent.children.length; i++) {
          this.forget(parent.children[i]);  //forget all old node references (not needed if name is removed from id)
          parent.children[i-1] = this.visit(parent.children[i], childId(parentId, i - 1));
        }
        this.pop(parentId);
      } else {
        this.pop(parentId);
      }
    }
  }

  move(fromId: string, toParentId: string, index: number) {
    const node = this.mapping[fromId];
    const parentDestinationExist = toParentId in this.mapping;
    if (node && parentDestinationExist) {
      const [ parentId, i ] = getParentAndIndex(fromId);
      this.remove(parentId, i);
      this.insert(toParentId, node, index);
    }
  }

  update(id: string, updates: Partial<NodeLike>) {
    const node = this.mapping[id];
    delete updates['children']; // Remove children if any
    for (const key in updates) {
      node[key] = updates[key];
    }
  }

  get(id: string) {
    const node = this.mapping[id];
    if (node && isElementNode(node)) {
      return new MorphElement(this, node);
    }
  }
}


export class MorphElement {
  constructor(
    private template: MorphTemplate,
    private node: ElementNode
  ) {}

  push = this.template.push.bind(this.template, this.node.id);
  insert = this.template.insert.bind(this.template, this.node.id);
  pop = this.template.pop.bind(this.template, this.node.id);
  remove = this.template.remove.bind(this.template, this.node.id);
}
