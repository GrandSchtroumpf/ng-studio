import { Decorator, ObjectLiteralExpression, ts, Node, SyntaxKind, StringLiteral, ArrayLiteralExpression, Identifier, ClassDeclaration, ComputedPropertyName, ArrowFunction, FunctionExpression, NumericLiteral, ExpressionWithTypeArguments } from 'ts-morph';

export function getStructure(node: Node<ts.Node>) {
  switch (node.getKind()) {
    case SyntaxKind.Identifier: return getIdentifierStructure(node as any);
    case SyntaxKind.StringLiteral:
    case SyntaxKind.NumericLiteral:
      return getLiteralStructure(node as any);
    case SyntaxKind.ArrayLiteralExpression: return getArrayStructure(node as any);
    case SyntaxKind.ObjectLiteralExpression: return getObjectLiteralExpressionStructure(node as any);
    case SyntaxKind.ComputedPropertyName: return getComputedPropertyNameStructure(node as any);
    
    case SyntaxKind.ArrowFunction: return getArrowFunctionStructure(node as any);
    case SyntaxKind.FunctionExpression: return getFunctionExpressionStructure(node as any);

    // Supercharge current structure with expressions
    case SyntaxKind.Decorator: return getDecoratorStructure(node as any);
    case SyntaxKind.ClassDeclaration: return getClassDeclarationStructure(node as any);
    default: return {
      kind: node.getKind(),
      value: node.getText()
    };
  }
}

export const getLiteralStructure = (node: StringLiteral | NumericLiteral) => ({
  kind: node.getKind(),
  value: node.getLiteralText()
})

export const getIdentifierStructure = (node: Identifier) => ({
  kind: node.getKind(),
  value: node.getText()
});

export const getArrayStructure = (node: ArrayLiteralExpression) => ({
  kind: node.getKind(),
  elements: node.getElements().map(element => getStructure(element))
});

// Object

export const getObjectLiteralExpressionStructure = (node: ObjectLiteralExpression) => ({
  kind: node.getKind(),
  properties: node.getProperties().map(property => property.getStructure())
});

export const getComputedPropertyNameStructure = (node: ComputedPropertyName) => ({
  kind: node.getKind(),
  // TODO
})


export const getArrowFunctionStructure = (node: ArrowFunction) => ({
  kind: node.getKind(),
  isAsync: !!node.getAsyncKeyword(),
  parameters: node.getParameters().map(p => p.getStructure())
});

export const getFunctionExpressionStructure = (node: FunctionExpression) => ({

});



export const getClassDeclarationStructure = (node: ClassDeclaration) => ({
  kind: SyntaxKind.ClassDeclaration,
  name: node.getName(),
  isAbstract: !!node.getAbstractKeyword(),
  isExported: !!node.getExportKeyword(),
  decorators: node.getDecorators().map(d => getStructure(d)),
  extends: getStructure(node.getExtends()),
  implements: node.getImplements().map(i => getStructure(i)),
  methods: node.getMethods().map(m => getStructure(m)),
  properties: node.getProperties().map(p => getStructure(p)),
  ctors: node.getConstructors().map(c => getStructure(c)),
});

// Decorator
export const getDecoratorStructure = (node: Decorator) => ({
  kind: node.getKind(),
  name: node.getName(),
  arguments: node.getArguments().map(arg => getStructure(arg)),
  typeArguments: node.getTypeArguments().map(typeArg => getStructure(typeArg)),
});

// Expression with Typed Arguments
export const getExpressionWithTypesArgumentStructure = (node: ExpressionWithTypeArguments) => ({
  kind: node.getKind(),
});
