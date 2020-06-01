import { Node, Text, BoundText, Variable, Reference, BoundEvent, BoundAttribute, TextAttribute, Template, Content, Element } from '@angular/compiler/src/render3/r3_ast';
import { ASTWithSource } from '@angular/compiler';
import { isElement, isText, isBoundText, isTemplate, isContent } from '../helpers';

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

export const elementNode = (node: Partial<ElementNode>) => ({
  id: '',
  name: node.name,
  attributes: [],
  inputs: [],
  outputs: [],
  references: [],
  children: [],
  ...node
});

export function fromElement(node: Element, id: string) {
  return {
    id,
    name: node.name,
    attributes: node.attributes.map(attr => fromTextAttribute(attr)),
    inputs: node.inputs.map(attr => fromInput(attr)),
    outputs: node.outputs.map(attr => fromOutput(attr)),
    references: node.references.map(attr => fromReference(attr)),
    children: node.children.map((child, i) => fromNode(child, createId(id, i))),
  };
}

export function fromTemplate(node: Template, id: string) {
  return node.tagName === 'ng-template'
    ? fromNgTemplate(node, id)
    : fromStructuralDirective(node, id)
}

/** Match with Element Node */
export function fromNgTemplate(node: Template, id: string): ElementNode {
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
export function fromStructuralDirective(node: Template, id: string): ElementNode {
  const child = fromNode(node.children[0], id);
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

export const contentNode = (node: Partial<ContentNode> = {}) => ({
  id: '',
  selector: '*',
  attributes: [],
  ...node
});

export function fromContent(node: Content, id: string) {
  return {
    id,
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

export const textNode = (text: string = '') => ({
  id: '',
  value: text,
})

export function fromText(node: Text, id: string): TextNode {
  return {
    id,
    value: node.value
  }
}

export function fromBoundText(node: BoundText, id: string): TextNode {
  return {
    id,
    value: (node.value as ASTWithSource).source
  }
}

// TODO : ICU

export function createId(id: string | number, index?: string | number) {
  if (id === undefined) {
    return `${index}`;
  }
  if (index === undefined) {
    return `${id}`
  }
  return `${id}-${index}`;
}

export function getParentAndIndex(id: string) {
  const shards = id.split('-');
  const index = parseInt(shards.pop(), 10);
  const parentId = shards.join('-');
  return [ parentId, index ] as const;
}