import { Plugin, PluginOptions } from '@remixproject/engine';
import { ExtensionContext, Disposable, window, commands, TreeDataProvider, TreeItem, TreeItemCollapsibleState, TreeView, EventEmitter } from 'vscode';
import { ProjectSymbols, ModuleSymbol, DirectiveSymbol, ResourceResolver } from 'ngast';
import { getContext, getDirectiveNode, WorkspaceSymbol, ProjectSymbol } from 'ng-morph/typescript';
import { join } from 'path';
import { promises, readFileSync, watch, FSWatcher, symlink } from 'fs';

interface WorkspaceOptions extends PluginOptions {
  root: string;
  context: ExtensionContext;
}


export class WorkspacePlugin extends Plugin {
  private listeners: Disposable[] = [];
  protected options: WorkspaceOptions;
  private onChange: FSWatcher;
  private treeView: TreeView<Symbols>;
  workspace: WorkspaceSymbol;
  projects: Record<string, ProjectSymbols>;
  modules: Record<string, ModuleSymbol>;
  directives: Record<string, DirectiveSymbol>;

  project: ProjectSymbols;
  tree: WorkspaceTree;

  constructor(options: WorkspaceOptions) {
    super({ name: 'workspace' });
    this.setOptions(options);
  }

  setOptions(options: Partial<WorkspaceOptions>) {
    super.setOptions(options);
  }

  async onActivation() {
    const workspace = await WorkspaceSymbol.fromPath(this.options.root);

    // Create a repertory of all components
    this.tree = new WorkspaceTree(workspace);
    this.treeView = window.createTreeView('moduleTree', { treeDataProvider: this.tree });
    this.listeners = [
      this.treeView,
      commands.registerCommand('project.selected', project => this.selectProject(project)),
      commands.registerCommand('module.selected', module => this.selectModule(module)),
      commands.registerCommand('directive.selected', directive => this.selectDirective(directive)),
    ];
  }

  onDeactivation() {
    this.listeners.forEach(listener => listener.dispose());
  }

  selectProject(symbol: ProjectSymbol) {
    symbol.init();
    symbol.getModules().forEach(module => console.log(getModuleName(module)))
    this.tree.render();
  }

  selectModule(symbol: ModuleSymbol) { }

  async selectDirective(symbol: DirectiveSymbol) {
    if (this.onChange) {
      this.onChange.close();
    }
    const { name, filePath } = symbol.getNonResolvedMetadata().type.reference;

    const node = getDirectiveNode(symbol);
    const update = () =>  this.emit('selectDirective', node);
    update();
    this.onChange = watch(filePath, 'utf-8', () => update());
  }

}

type Symbols = ProjectSymbol | ModuleSymbol | DirectiveSymbol;

class WorkspaceTree implements TreeDataProvider<Symbols> {
  private onChange = new EventEmitter<Symbols>();
  onDidChangeTreeData = this.onChange.event;
  constructor(private workspace: WorkspaceSymbol) {}

  render() {
    this.onChange.fire();
  }

  getTreeItem(item: Symbols) {
    if (item instanceof ProjectSymbol) {
      return new ProjectItem(item);
    }
    if (item instanceof ModuleSymbol) {
      return new ModuleItem(item);
    }
    if (item instanceof DirectiveSymbol) {
      return new DirectiveItem(item);
    }
  }

  getChildren(item?: Symbols) {
    if (!item) {
      return this.workspace.getProjects();
    }
    if (item instanceof ProjectSymbol) {
      return item.getModules();
    }
    if (item instanceof ModuleSymbol) {
      return item.getDeclaredDirectives();
    }
    return [];
  }
}

/////////////
// PROJECT //
/////////////

export class ProjectItem extends TreeItem {
  command = {
    title: 'Select project',
    command: 'project.selected',
    arguments: [this.symbol]
  }
  constructor(public symbol: ProjectSymbol) {
    super('to define', TreeItemCollapsibleState.Collapsed);
  }
}

////////////
// MODULE //
////////////

function getModuleName(symbol: ModuleSymbol) {
  return symbol.getModuleSummary().type.reference.name;
}

function getModuleCollapse(symbol: ModuleSymbol) {
  return symbol.getDeclaredDirectives().length
    ? TreeItemCollapsibleState.Collapsed
    : TreeItemCollapsibleState.None;
}

export class ModuleItem extends TreeItem {
  command = {
    title: 'Select module',
    command: 'module.selected',
    arguments: [this.symbol]
  }
  constructor(private symbol: ModuleSymbol) {
    super(getModuleName(symbol), getModuleCollapse(symbol));
  }
}


///////////////
// DIRECTIVE //
///////////////

function getName(symbol: DirectiveSymbol) {
  return symbol.getNonResolvedMetadata().type.reference.name || 'No Name';
}
function getSelector(symbol: DirectiveSymbol) {
  return symbol.getNonResolvedMetadata().selector || 'No Selector';
}

export class DirectiveItem extends TreeItem {
  description = getName(this.symbol);
  command = {
    title: 'Select directive',
    command: 'directive.selected',
    arguments: [this.symbol]
  }
  constructor(private symbol: DirectiveSymbol) {
    super(getSelector(symbol));
  }
}