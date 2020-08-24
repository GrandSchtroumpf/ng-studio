import { Node, Text, BoundText, Variable, Reference, BoundEvent, BoundAttribute, TextAttribute, Template, Content, Element } from '@angular/compiler/src/render3/r3_ast';
import { ASTWithSource } from '@angular/compiler';
import { isElement, isText, isBoundText, isTemplate, isContent } from '../helpers';

export type HtmlNode = ElementNode | ContentNode | TextNode;

export interface TagNode {
  id: string;
  name: string;
  attributes: AttributeNode[];
  inputs: AttributeNode[];
  outputs: AttributeNode[];
  children: HtmlNode[];
  references: AttributeNode[];
}

export interface ElementNode extends TagNode{
  template?: TemplateNode;
}

export interface NgTemplateNode extends TagNode {
  variables: AttributeNode[];
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
  return ('id' in node) && ('children' in node) && ('name' in node) && (node.name !== 'ng-template');
}

export function isNgTemplateNode(node: HtmlNode): node is NgTemplateNode {
  return ('id' in node) && ('children' in node) && ('name' in node) && (node.name === 'ng-template');
}

export function isContentNode(node: HtmlNode): node is ContentNode {
  return 'id' in node && 'selector' in node;
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

export function elementNode(node: Partial<ElementNode>): ElementNode {
  node.id = node.id || '';
  node.name = node.name || '';
  node.attributes = node.attributes || [];
  node.inputs = node.inputs || [];
  node.outputs = node.outputs || [];
  node.references = node.references || [];
  node.children = node.children || [];
  return node as ElementNode;
}

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

export function ngTemplateNode(node: Partial<NgTemplateNode>): NgTemplateNode {
  node.id = node.id || '';
  node.name = 'ng-template';
  node.attributes = node.attributes || [];
  node.inputs = node.inputs || [];
  node.outputs = node.outputs || [];
  node.references = node.references || [];
  node.children = node.children || [];
  node.variables = node.variables || [];
  return node as NgTemplateNode;
}

/** Match with Element Node */
export function fromNgTemplate(node: Template, id: string): NgTemplateNode {
  return {
    id,
    name: node.tagName,
    attributes: node.attributes.map(attr => fromTextAttribute(attr)),
    inputs: node.inputs.map(attr => fromInput(attr)),
    outputs: node.outputs.map(attr => fromOutput(attr)),
    references: node.references.map(attr => fromReference(attr)),
    variables: node.variables.map(attr => fromVariable(attr)),
    children: node.children.map((child, i) => fromNode(child, `${id}_${i}`)),
  }
}

export function structuralDirective(node: Partial<TemplateNode>): TemplateNode {
  node.tagName = node.tagName || '';
  node.templateAttrs = node.templateAttrs || [];
  node.variables = node.variables || [];
  return node as TemplateNode;
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

export const contentNode = (node: Partial<ContentNode> = {}): ContentNode => ({
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
export function attributeNode(node: Partial<AttributeNode>): AttributeNode {
  return {
    name: node.name || '',
    value: node.value || ''
  }
}


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