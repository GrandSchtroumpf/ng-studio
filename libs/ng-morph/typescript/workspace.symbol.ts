import { workspaces } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node';
import { ProjectSymbols, ResourceResolver } from 'ngast';
import { join } from 'path';
import { promises as fs, readFileSync } from 'fs';

export const resourceResolver: ResourceResolver = {
  get(url: string) {
    return fs.readFile(url, 'utf-8');
  },
  getSync(url: string) {
    return readFileSync(url).toString();
  }
};

const defaultErrorReporter = (e: any, path: string) => console.error(e, path);

export class WorkspaceSymbol {
  private config: workspaces.WorkspaceDefinition;
  private root: string;

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
    const projects = [];
    for (const [ name, project ] of this.config.projects) {
      const tsconfig = project.targets.get('build').options.tsConfig as string;
      const tsConfigPath = join(this.root, tsconfig);
      const symbol = new ProjectSymbols(tsConfigPath, resourceResolver, defaultErrorReporter);
      projects.push(symbol);
    }
    return projects;
  }

}