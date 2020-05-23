import { NgWorkspace, NgProject } from './types';

interface WorkspaceOptions {
  fs?: any;
  root: string;
}

class Workspace {
  config: NgWorkspace;
  appNames: string[] = [];
  libNames: string[];
  projects: Record<string, Project> = {};
  constructor(workspacePath: string = 'angular.json') {}
  
  get apps(): App[] {
    return this.appNames.map(name => this.projects[name] as App);
  }
  
  get libs(): Lib[] {
    return this.libNames.map(name => this.projects[name] as Lib);
  }

  load() {
    // this.config = fs...
    for (const name in this.config.projects) {
      const project = this.config.projects[name];
      if (project.projectType === 'application') {
        this.appNames.push(name);
        this.projects[name] = new App(project);
      }
      if (project.projectType === 'library') {
        this.libNames.push(name);
        this.projects[name] = new Lib(project);
      }
    }
  }
}

class Project {
  constructor(protected config: NgProject) {}
}

interface AppParserOptions extends NgProject {
  appModulePath: string;
}

class App extends Project {

  rootModule() {
    `${this.config.root}/app/app.module.ts`
  }
}

class Lib extends Project {}