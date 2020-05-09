import { Component } from '@angular/core';
import { DecoratorStructure, StructureKind } from 'ts-morph';


const componentDecorator = (component: Component): DecoratorStructure => ({
  kind: StructureKind.Decorator,
  name: 'Component',
  arguments: [JSON.stringify(component)]
})

const inputDecorator = (): DecoratorStructure => ({
  kind: StructureKind.Decorator,
  name: 'Input',
})

const viewChildDecorator = (): DecoratorStructure => ({
  kind: StructureKind.Decorator,
  name: 'ViewChild',
})