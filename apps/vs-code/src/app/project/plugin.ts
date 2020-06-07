import { Plugin, PluginOptions } from '@remixproject/engine';
import { ExtensionContext, Disposable, window, commands } from 'vscode';
import { ProjectSymbols, ModuleSymbol, DirectiveSymbol, ResourceResolver } from 'ngast';
import { join } from 'path';
import { ModuleTree } from './tree';
import { promises, readFileSync } from 'fs';

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


export class ProjectPlugin extends Plugin {
  private listeners: Disposable[] = [];
  protected options: ProjectOptions;
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
    console.log(symbol.getModuleSummary())
  }

  selectDirective(symbol: DirectiveSymbol) {
    const metadata = symbol.getResolvedMetadata();
    this.call('template', 'init', metadata);
  }

}




