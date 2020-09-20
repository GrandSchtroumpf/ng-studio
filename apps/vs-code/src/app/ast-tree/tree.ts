import { TreeDataProvider, TreeItem, TreeItemCollapsibleState, EventEmitter } from 'vscode';
import type { workspaces } from '@angular-devkit/core';
import * as fs from 'fs';
import { WorkspaceSymbols, NgModuleSymbol, ComponentSymbol } from 'ng-ast';
import { join } from 'path';

export type WorkspaceItem = ProjectItem | NgModuleItem | ComponentItem;

export class WorkspaceTree implements TreeDataProvider<WorkspaceItem> {
  private onChange = new EventEmitter<WorkspaceItem>();
  private analysed: Promise<boolean>;
  private workspace: WorkspaceSymbols;
  onDidChangeTreeData = this.onChange.event;
  constructor(
    private root: string,
    private config: workspaces.WorkspaceDefinition
  ) {
    const tsconfig = ['tsconfig.base.json', 'tsconfig.json']
      .map(path => join(root, path))
      .find(path => fs.existsSync(path));
    this.workspace = new WorkspaceSymbols(tsconfig);
    this.analysed = this.workspace.preAnalyse();
  }

  render() {
    this.onChange.fire(undefined);
  }

  getTreeItem(item: WorkspaceItem) {
    return item;
  }

  async getChildren(item: ProjectItem | NgModuleItem) {
    if (!item) {
      const projects: ProjectItem[] = [];
      for (const [name, value] of this.config.projects.entries()) {
        const item = new ProjectItem(name, value);
        projects.push(item);
      }
      return projects;
    }

    if (item instanceof ProjectItem) {
      if (await this.analysed) {
        const base = join(this.root, item.project.sourceRoot).split('\\').join('/');
        return this.workspace.getAllModules()
          .filter(m => m.path.startsWith(base))
          .map(m => new NgModuleItem(m));
      }
    }
    if (item instanceof NgModuleItem) {
      return item.getComponents();
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
    arguments: [this.name, this.project]
  }
  constructor(public name: string, public project: workspaces.ProjectDefinition) {
    super(name, TreeItemCollapsibleState.Collapsed);
  }

}

////////////
// MODULE //
////////////

function getModuleCollapse(symbol: NgModuleSymbol) {
  return symbol.getDeclarations().filter(s => s.isSymbol('Component')).length
    ? TreeItemCollapsibleState.Collapsed
    : TreeItemCollapsibleState.None;
}

export class NgModuleItem extends TreeItem {
  command = {
    title: 'Select module',
    command: 'module.selected',
    arguments: [this.symbol]
  }
  constructor(private symbol: NgModuleSymbol) {
    super(symbol.name, getModuleCollapse(symbol));
  }

  getComponents() {
    return this.symbol.getDeclarations()
      .filter(s => s.isSymbol('Component'))
      .map((s: ComponentSymbol) => new ComponentItem(s));
  }
}


///////////////
// COMPONENT //
///////////////

export class ComponentItem extends TreeItem {
  description = this.symbol.name;
  command = {
    title: 'Select component',
    command: 'component.selected',
    arguments: [this.symbol]
  }
  constructor(private symbol: ComponentSymbol) {
    super(symbol.metadata.selector);
  }
}