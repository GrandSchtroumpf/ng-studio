import { DirectiveSymbol } from "ngast";
import { isMethodDeclaration, MethodDeclaration, isPropertyDeclaration, PropertyDeclaration } from 'typescript';

export interface ComponentContext {
  methods: string[];
  properties: string[];
  selectors: string[];
}

export function getContext(symbol: DirectiveSymbol): ComponentContext {
  const node = symbol.getNode();
  const methods = node.members.filter(isMethodDeclaration).map((member: MethodDeclaration) => member.name.getText());
  const properties = node.members.filter(isPropertyDeclaration).map((member: PropertyDeclaration) => member.name.getText());
  const selectors = symbol.getDirectiveContext().directives.map(directive => directive.selector);
  return { methods, properties, selectors };
}