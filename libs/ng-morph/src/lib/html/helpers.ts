import { Element, Node, Template, Text, TextAttribute, BoundAttribute, BoundEvent, Reference, BoundText, Content } from '@angular/compiler/src/render3/r3_ast';
import { AST } from '@angular/compiler';

export function isElement(node: Node): node is Element {
  return 'name' in node;
}

export function isTemplate(node: Node): node is Template {
  return 'tagName' in node;
}

export function isContent(node: Node): node is Content {
  return 'selector' in node && 'attributes' in node;
}

export function isBoundText(node: Node): node is BoundText {
  return 'value' in node && !('name' in node) && typeof node['value'] === 'object'; // check "isAst(node['value'])" instead
}

export function isText(node: Node): node is Text {
  return 'value' in node && !('name' in node) && typeof node['value'] === 'string';
}

export function isTextAttribute(node: Node): node is TextAttribute {
  return ('name' in node) && ('value' in node) && typeof node['value'] === 'string';
}
