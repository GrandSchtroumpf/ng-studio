// export * from './lib/component';
// export * from './lib/module';
// import { ClassDeclarationStructure } from 'ts-morph';

// Cannot import ts-morph in angular because of "path"

export * from './lib/utils';

const decorators = ['Component', 'NgModule'];

export function getDecoratorType(structure: any) {
  if (structure.decorators.length) {
    return structure.decorators.map(d => d.name).find(name => decorators.includes(name));
  }
}

/** Transform a decorator into a config decorator */
export const withConfig = (structure: any) => ({
  ...structure,
  config: JSON.parse(structure.decorators[0]?.arguments[0])
});
