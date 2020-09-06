import { ComponentSymbol } from 'ng-ast';

type Keysof<T> = (Extract<keyof T, string>)[];
// Extract only the keys that we want
type ValueOf<T, K extends Keysof<T>> = { [key in K[number]]: T[key] };

// Get a subset of keys from the source
function getKeysOf<T, K extends Keysof<T>>(source: T, keys: K): ValueOf<T, K> {
  const result: Partial<T> = {};
  for (const key of keys) {
    result[key] = source[key];
  }
  return result as ValueOf<T, K>;
}


type TemplateState = ReturnType<typeof getTemplateState>;

function getTemplateState(template: ComponentSymbol['analysis']['template']) {
  return getKeysOf(template, ['isInline', 'styles', 'styleUrls', 'template', 'templateUrl']);
}

type MetadataState = ReturnType<typeof getMetadataState>;

function getMetadataState(metadata: ComponentSymbol['metadata']) {
  return getKeysOf(metadata, [
    'animations',
    'changeDetection',
    'deps',
    'encapsulation',
    'exportAs',
    'host',
    'i18nUseExternalIds',
    'inputs',
    'lifecycle',
    'name',
    'outputs',
    'providers',
    'queries',
    'relativeContextFilePath',
    'selector',
    'styles',
    'template',
    'typeArgumentCount',
    'usesInheritance',
    'viewProviders',
    'viewQueries',
  ]);
}

export interface ComponentState {
  name: string;
  path: string;
  metadata: MetadataState;
  template: TemplateState;
  guards: ComponentSymbol['analysis']['guards'];
  pipeScope: string[];
  selectorScope: string[];
}

export function getComponentState(component: ComponentSymbol): ComponentState {
  return {
    name: component.name,
    path: component.path,
    guards: component.analysis.guards,
    pipeScope: component.getPipeScope(),
    selectorScope: component.getSelectorScope(),
    template: getTemplateState(component.analysis.template),
    metadata: getMetadataState(component.metadata),
  }
}
