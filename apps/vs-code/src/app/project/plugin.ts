import { Plugin, PluginOptions } from '@remixproject/engine';
import { ExtensionContext, Disposable, window, commands } from 'vscode';
import { ProjectSymbols, ModuleSymbol, DirectiveSymbol, ResourceResolver } from 'ngast';
import { getDirectiveNode } from 'ng-morph/typescript';
import { join } from 'path';
import { ModuleTree, isOwnModule } from './tree';
import { promises, readFileSync, watch, FSWatcher } from 'fs';

export const resourceResolver: ResourceResolver = {
  get(url: string) {
    return promises.readFile(url, 'utf-8');
  },
  getSync(url: string) {
    return readFileSync(url).toString();
  }
};

const defaultErrorReporter = (e: any, path: string) => console.error(e, path);

interface ProjectOptions extends PluginOptions {
  root: string;
  context: ExtensionContext;
}


function createLazyCmptRepertory(root: string, modules: ModuleSymbol[]) {
  const ownModules = modules.filter(isOwnModule).map(module => {
    const cmpts = module.getDeclaredDirectives().filter(directive => directive.isComponent());
    return cmpts
      .map(cmpt => cmpt.getNonResolvedMetadata().type.reference)
      .map(ref => `${ref.name}: () => import('${ref.filePath.replace('.ts', '')}').then(m => m.${ref.name}),`)
      .join('\n')
  }).join('\n');
  const code = `export const components = {\n${ownModules}\n};\n`;
  promises.writeFile(`${root}/components.ts`, code);
}

export class ProjectPlugin extends Plugin {
  private listeners: Disposable[] = [];
  protected options: ProjectOptions;
  private onChange: FSWatcher;
  project: ProjectSymbols;
  tree: ModuleTree;

  constructor(options: ProjectOptions) {
    super({ name: 'project' });
    this.setOptions(options);
  }

  setOptions(options: Partial<ProjectOptions>) {
    super.setOptions(options);
  }

  onActivation() {
    const tsconfig = join(this.options.root, 'tsconfig.app.json');
    this.project = new ProjectSymbols(tsconfig, resourceResolver, defaultErrorReporter);
    const modules = this.project.getModules();

    // Create a repertory of all components
    createLazyCmptRepertory(this.options.root, modules);

    this.tree = new ModuleTree(modules);
    this.listeners = [
      window.createTreeView('moduleTree', { treeDataProvider: this.tree }),
      commands.registerCommand('module.selected', module => this.selectModule(module)),
      commands.registerCommand('directive.selected', directive => this.selectDirective(directive)),
    ];
  }

  onDeactivation() {
    this.listeners.forEach(listener => listener.dispose());
  }

  selectModule(symbol: ModuleSymbol) {
    // console.log(symbol.getModuleSummary())
  }

  async selectDirective(symbol: DirectiveSymbol) {
    if (this.onChange) {
      this.onChange.close();
    }
    const { name, filePath } = symbol.getNonResolvedMetadata().type.reference;
    const node = getDirectiveNode(symbol);
    const update = () => this.emit('selectDirective', node);
    update();
    this.onChange = watch(filePath, 'utf-8', () => update());
  }

}
