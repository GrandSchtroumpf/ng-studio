import { NgModule } from '@angular/core';
import { DecoratorStructure, StructureKind } from 'ts-morph';

export function isNgModule(decorator: DecoratorStructure) {
  return decorator.name === 'NgModule';
}

/** Transform a decorator into a component decorator */
export const toNgModule = (decorator: DecoratorStructure) => JSON.parse(decorator.arguments[0]);

export const ngModuleDecorator = (module: NgModule): DecoratorStructure => ({
  kind: StructureKind.Decorator,
  name: 'NgModule',
  arguments: [JSON.stringify(module)]
})