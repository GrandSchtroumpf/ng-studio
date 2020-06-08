import { DirectiveSymbol } from "ngast";
import { isMethodDeclaration, MethodDeclaration, isPropertyDeclaration, PropertyDeclaration } from 'typescript';
import { CompileDirectiveMetadata, CompileTemplateMetadata } from '@angular/compiler';

export interface DirectiveContext {
  methods: string[];
  properties: string[];
  selectors: string[];
}

export function getContext(symbol: DirectiveSymbol): DirectiveContext {
  const node = symbol.getNode();
  const methods = node.members.filter(isMethodDeclaration).map((member: MethodDeclaration) => member.name.getText());
  const properties = node.members.filter(isPropertyDeclaration).map((member: PropertyDeclaration) => member.name.getText());
  const selectors = symbol.getDirectiveContext().directives.map(directive => directive.selector);
  return { methods, properties, selectors };
}

export interface DirectiveNode {
  context: DirectiveContext;
  metadata: CompileDirectiveMetadata;
  templateMetadata: CompileTemplateMetadata;
}

export function getDirectiveNode(symbol: DirectiveSymbol): DirectiveNode {
  return {
    context: getContext(symbol),
    metadata: symbol.getNonResolvedMetadata(),
    templateMetadata: symbol.getResolvedMetadata(),
  }
}