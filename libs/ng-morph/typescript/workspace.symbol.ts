import { workspaces } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';
import { ResourceResolver, ModuleSymbol } from 'ngast';
import { join } from 'path';
import { promises as fs, readFileSync } from 'fs';
import { ProjectSymbol } from './project.symbol';

export class WorkspaceSymbol {
  private config: workspaces.WorkspaceDefinition;
  private root: string;
  private projects: ProjectSymbol[];

  static async fromPath(root: string) {
    const workspace = new WorkspaceSymbol();
    await workspace.init(root);
    return workspace;
  }

  async init(root: string) {
    this.root = root;
    const ngJsonPath = join(root, 'angular.json');
    const host = workspaces.createWorkspaceHost(new NodeJsSyncHost());
    const { workspace } = await workspaces.readWorkspace(ngJsonPath, host);
    this.config = workspace;
  }

  async getProjects() {
    if (!this.projects) {
      this.projects = [];
      for (const [ name, project ] of this.config.projects) {
        const tsconfig = project.targets.get('build')?.options?.tsConfig as string;
        if (tsconfig) {
          const tsConfigPath = join(this.root, tsconfig);
          const symbol = new ProjectSymbol(tsConfigPath);
          this.projects.push(symbol);
        }
      }
    }
    return this.projects;
  }

}
