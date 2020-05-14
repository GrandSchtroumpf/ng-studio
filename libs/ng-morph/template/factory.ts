import * as ng from '@angular/compiler/src/render3/r3_ast';
import { BindingType } from '@angular/compiler';
import { SecurityContext } from '@angular/compiler/src/core';
import { Message, Node as i18nNode } from '@angular/compiler/src/i18n/i18n_ast';
import { isElement } from './helpers';

import { Parser } from "@angular/compiler/src/expression_parser/parser";
import { Lexer } from "@angular/compiler/src/expression_parser/lexer";

const lexer = new Lexer();
const parser = new Parser(lexer);

/////////
// AST //
/////////
export function createAstWithSource(source: string) {
  return parser.parseSimpleBinding(source, undefined, undefined);
}


//////////
// TEXT //
//////////

export function createText(text: string = '') {
  return new ng.Text(text, undefined);
}

/////////////
// ELEMENT //
/////////////

/**
 * Create an element node (default 'div')
 * @param element Properties of the element
 */
export function createElement(element: Partial<ng.Element> = {}) {
  const {
    name = 'div',
    attributes = [],
    inputs = [],
    outputs = [],
    children = [],
    references = [],
    i18n
  } = element;
  return new ng.Element(name, attributes, inputs, outputs, children, references, undefined, undefined, undefined, i18n);
}

export function createTextAttribute(name: string, value: string, i18n?: Message | i18nNode) {
  return new ng.TextAttribute(name, value, undefined, undefined, i18n)
}

// Input
export function createBoundAttribute(name: string, value: string, options: Partial<ng.BoundAttribute> = {}) {
  const valueAst = createAstWithSource(value);
  const {
    type = BindingType.Property,
    securityContext = SecurityContext.NONE,
    unit = null,
    i18n
  } = options;
  return new ng.BoundAttribute(name, type, securityContext, valueAst, unit, undefined, undefined, i18n);
}


// Output
export function createOutput() {}

// Reference
export function createReference(name: string, value: string = '') {
  return new ng.Reference(name, value, undefined, undefined);
}

//////////////
// TEMPLATE //
//////////////

function getTagElement(template: Partial<ng.Template>): ng.Element {
  if (template.children.length && template.tagName) {
    return template.children.find(child => isElement(child) && child.name === template.tagName) as ng.Element;
  }
}

/**
 * Create a template tag (default 'ng-template')
 * @param template Create 
 */
export function createTemplate(template: Partial<ng.Template> = {}) {
  // If not children is provided for a tagNamed template, create it
  if (!!template.tagName && template.tagName !== 'ng-template') {
    if (!template.children?.length) {
      template.children = [createElement({ name: template.tagName })];
    } else if (!getTagElement(template)) {
      throw new Error(`TagName "${template.tagName}" from Template does not match the child Element`);
    }
  }
  const {
    tagName = 'ng-template',
    attributes = [],
    inputs = [],
    outputs = [],
    templateAttrs = [],
    children = [],
    references = [],
    variables = [],
    i18n
  } = template;
  return new ng.Template(tagName, attributes, inputs, outputs, templateAttrs, children, references, variables, undefined, undefined, undefined, i18n)
}

/**
 * Create a template variable (default is '')
 * @param variable 
 */
export function createVariable(name: string, value: string = '') {
  return new ng.Variable(name, value, undefined);
}

// export function createNgIf(variable: string, tagName = 'ng-container') {
//   const templateAttrs = [createBoundAttribute('ngIf', variable)]
//   const variables = [createVariable(variable, 'ngIf')];
//   return createTemplate({ tagName })
// }


/////////////
// CONTENT //
/////////////
export function createContent(selector: string = '') {
  const attributes = selector ? [createTextAttribute('select', selector)] : [];
  return new ng.Content(selector || '*', attributes, undefined);
}