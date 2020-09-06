import { Plugin, PluginOptions } from '@remixproject/engine';
import { WorkspaceSymbols as ProjectSymbols, NgModuleSymbol, ComponentSymbol } from 'ng-ast';
import { workspaces } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';
import { commands, window, ExtensionContext, Disposable, TreeView } from 'vscode';
import { watch, FSWatcher } from 'fs';
import { join } from 'path';
import { WorkspaceTree, WorkspaceItem } from './tree';
import { getComponentState, isProjectType } from 'ng-morph/typescript';
import { exec, ChildProcess } from 'child_process';

interface WorkspaceOptions extends PluginOptions {
  root: string;
  context: ExtensionContext;
}

export class WorkspacePlugin extends Plugin {
  private listeners: Disposable[] = [];
  private childProcess: ChildProcess[] = [];
  protected options: WorkspaceOptions;
  private onChange: FSWatcher;
  private treeView: TreeView<WorkspaceItem>;
  workspace: workspaces.WorkspaceDefinition;

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
    const root = this.options.root;
    const workspace = await this.getWorkspace();
    // Create a repertory of all components
    this.tree = new WorkspaceTree(root, workspace);
    this.treeView = window.createTreeView('workspaceTree', { treeDataProvider: this.tree });
    this.listeners = [
      this.treeView,
      commands.registerCommand('project.selected', (name, project) => this.selectProject(name, project)),
      commands.registerCommand('module.selected', module => this.selectModule(module)),
      commands.registerCommand('component.selected', directive => this.selectComponent(directive)),
    ];

    // Run build on every application
    for (const [name, project] of workspace.projects.entries()) {
      if (isProjectType(project, 'application')) {
        this.childProcess.push(this.watchBuild(root, name));
      }
    }
  }

  onDeactivation() {
    this.listeners.forEach(listener => listener.dispose());
    this.childProcess.forEach(event => event.disconnect());
  }

  async getWorkspace() {
    if (!this.workspace) {
      const ngJsonPath = join(this.options.root, 'angular.json');
      const host = workspaces.createWorkspaceHost(new NodeJsSyncHost());
      const { workspace } = await workspaces.readWorkspace(ngJsonPath, host);
      this.workspace = workspace;
    }
    return this.workspace;
  }

  // TODO : use vscode terminal
  watchBuild(root: string, projectName: string) {
    const child = exec(`npx ng build ${projectName} --watch`, { cwd: root });
    child.stdout.on('data', (data) => console.log(data));
    return child;
  }

  selectProject(name: string, project: workspaces.ProjectDefinition) {
    if (isProjectType(project, 'application')) {
      this.call('manager', 'activatePlugin', `local-${name}`)
    }
  }

  selectModule(symbol: NgModuleSymbol) { }

  async selectComponent(component: ComponentSymbol) {
    if (this.onChange) {
      this.onChange.close();
    }
    const update = async () => {
      await this.call('manager', 'activatePlugin', 'template');
      this.emit('selectComponent', getComponentState(component));
    }
    this.onChange = watch(component.path, 'utf-8', () => update());
    update();
  }

}