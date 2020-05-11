import * as html from '@angular/compiler/src/ml_parser/ast';
import * as ng from '@angular/compiler';

function isElement(node: html.Node): node is html.Element {
  return 'name' in node;
}

function getNode(node: html.Node) {
  if (isElement(node)) {
    return getElement(node);
  }
}

function getElement(node: html.Element) {

}

function move(parent: Element, to: Element) {

}