import { Component } from '@angular/core';
import { ClassDeclarationStructure, DecoratorStructure, StructureKind } from 'ts-morph';

export function isComponent(decorator: DecoratorStructure) {
  return decorator.name === 'Component';
}

/** Transform a decorator into a component decorator */
export const toComponent = (structure: ClassDeclarationStructure) => ({
  ...structure,
  config: JSON.parse(structure.decorators[0]?.arguments[0])
});


export const componentDecorator = (component: Component): DecoratorStructure => ({
  kind: StructureKind.Decorator,
  name: 'Component',
  arguments: []
})

export const inputDecorator = (): DecoratorStructure => ({
  kind: StructureKind.Decorator,
  name: 'Input',
})

export const viewChildDecorator = (): DecoratorStructure => ({
  kind: StructureKind.Decorator,
  name: 'ViewChild',
})
