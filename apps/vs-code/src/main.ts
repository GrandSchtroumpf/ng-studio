import { ExtensionContext, ViewColumn, workspace } from 'vscode';
import { WebviewPlugin } from './app/webview';

import { Engine } from '@remixproject/engine';
import { WindowPlugin } from './app/window.plugin';
import { VscodeManager } from './app/manager.plugin';

import { ProjectPlugin } from './app/project/plugin';
import { TemplatePlugin } from './app/template/plugin';
import { StylesheetPlugin } from './app/stylesheet/plugin';

import { WorkspacePlugin } from './app/ast-tree/plugin';
import { join } from 'path';
import { TerminalPlugin } from './app/terminal.plugin';
import { getProjectOutput, isProjectType } from 'ng-morph/typescript';

const inspectorProfile = {
  name: 'inspector',
  url: 'inspector',
  methods: ['select', 'setContext', 'updateNode'],
};

const styleEditorProfile = {
  name: 'styleEditor',
  url: 'style-editor',
  methods: [],
};


// On activation
export async function activate(context: ExtensionContext) {
  // Register command "start" 
  const [ folder ] = workspace.workspaceFolders;
  if (folder) {  
    const root = folder.uri.fsPath;


    const inspector = new WebviewPlugin(inspectorProfile, { context, column: ViewColumn.Two });
    // const styleEditor = new WebviewPlugin(styleEditorProfile, { context, column: ViewColumn.Two });
    const template = new TemplatePlugin({ context });
    // const stylesheet = new StylesheetPlugin();
    // const project = new ProjectPlugin({ context, root });

    const workspaceTree = new WorkspacePlugin({ context, root });
    const manager = new VscodeManager();
    const engine = new Engine(manager);
    const window = new WindowPlugin();
    const terminal = new TerminalPlugin();
    
    engine.onload(async () => {
      engine.register([ workspaceTree, window, terminal, inspector, template ]);
      manager.activatePlugin([ 'workspace' ]);

      // Create local plugins & register it
      const ngWorkspace = await workspaceTree.getWorkspace();
      for (const [projectName, project] of ngWorkspace.projects) {
        const output = getProjectOutput(project);
        if (isProjectType(project, 'application') && output) {
          const name = `local-${projectName}`;
          const url = join(root, output).split('\\').join('/');
          const local = new WebviewPlugin({name, url}, { context, column: ViewColumn.One, devMode: true });
          engine.register(local);
        }
      }
    });
  }
}
