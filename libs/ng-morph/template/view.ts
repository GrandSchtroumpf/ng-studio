// Create connection between AST & HTML Node

import { Element, Node, BoundAttribute, TextAttribute, BoundEvent, Reference, Template, Variable, Content, Text, BoundText } from "@angular/compiler/src/render3/r3_ast";
import { isElement, isTemplate, isContent, isText, isBoundText } from './helpers';
import { ASTWithSource } from '@angular/compiler';

type HtmlNode = ElementNode | ContentNode | Text;

interface ElementNode {
  id: string;
  name: string;
  template?: TemplateNode;
  attributes: AttributeNode[];
  inputs: AttributeNode[];
  outputs: AttributeNode[];
  children: HtmlNode[];
  references: AttributeNode[];
}

interface AttributeNode {
  name: string;
  value: string;
}

interface TemplateNode {
  tagName: string;
  variables: AttributeNode[];
  templateAttrs: AttributeNode[];
}

interface ContentNode {
  id: string;
  selector: string;
  attributes: AttributeNode[];
}

interface TextNode {
  id: string;
  value: string;
}

export function createAst(nodes: Node[]) {
  return nodes.map((node, i) => fromNode(node, `${i}`));
}

function fromNode(node: Node, id: string) {
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

/////////
// TAG //
/////////

function fromElement(node: Element, parentId: string) {
  const id = `${parentId}-${node.name}`;
  return {
    id,
    name: node.name,
    attributes: node.attributes.map(attr => fromTextAttribute(attr)),
    inputs: node.inputs.map(attr => fromInput(attr)),
    outputs: node.outputs.map(attr => fromOutput(attr)),
    references: node.references.map(attr => fromReference(attr)),
    children: node.children.map((child, i) => fromNode(child, `${id}_${i}`))
  }
}

function fromTemplate(node: Template, parentId: string) {
  return node.tagName === 'ng-template'
    ? fromNgTemplate(node, parentId)
    : fromStructuralDirective(node, parentId)
}

/** Match with Element Node */
function fromNgTemplate(node: Template, parentId: string): ElementNode {
  const id = `${parentId}-${node.tagName}`;
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
function fromStructuralDirective(node: Template, parentId: string): ElementNode {
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


function fromContent(node: Content, parentId: string) {
  return {
    id: `${parentId}-${node.selector}`,
    selector: node.selector,
    attributes: node.attributes.map(attr => fromTextAttribute(attr))
  }
}

////////////////
// ATTRIBUTES //
////////////////

function fromTextAttribute(node: TextAttribute): AttributeNode {
  return {
    name: node.name,
    value: node.value
  }
}

function fromInput(node: BoundAttribute): AttributeNode {
  return {
    name: node.name,
    value: (node.value as ASTWithSource).source
  }
}

function fromOutput(node: BoundEvent): AttributeNode {
  return {
    name: node.name,
    value: (node.handler as ASTWithSource).source
  }
}

function fromReference(node: Reference): AttributeNode {
  return {
    name: node.name,
    value: node.value
  }
}

function fromVariable(node: Variable): AttributeNode {
  return {
    name: node.name,
    value: node.value
  }
}


//////////
// TEXT //
//////////

function fromText(node: Text, parentId: string): TextNode {
  return {
    id: `${parentId}-text`,
    value: node.value
  }
}

function fromBoundText(node: BoundText, parentId: string): TextNode {
  return {
    id: `${parentId}-boundText`,
    value: (node.value as ASTWithSource).source
  }
}

// TODO : ICU