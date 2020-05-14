import { Element, Node, Template, Text, TextAttribute, BoundAttribute, BoundEvent, Reference } from '@angular/compiler/src/render3/r3_ast';
import { AST } from '@angular/compiler';

export function isElement(node: Node): node is Element {
  return 'name' in node;
}

export function isTemplate(node: Node): node is Template {
  return 'tagName' in node;
}

export function isText(node: Node): node is Text {
  return 'value' in node && !('name' in node);
}

export function isTextAttribute(node: Node): node is TextAttribute {
  return ('name' in node) && ('value' in node) && typeof node['value'] === 'string';
}
