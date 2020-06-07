import { ExtensionContext, ViewColumn, workspace } from 'vscode';
import { WebviewPlugin } from './app/webview';

import { Engine, PluginManager } from '@remixproject/engine';

import { ProjectPlugin } from './app/project/plugin';
import { TemplatePlugin } from './app/template/plugin';

const inspectorProfile = {
  name: 'inspector',
  url: 'inspector',
  methods: ['select', 'updateNode'],
}

// On activation
export function activate(context: ExtensionContext) {
  // Register command "start" 
  const [ folder ] = workspace.workspaceFolders;
  if (folder) {  
    const root = folder.uri.fsPath;
    // const builder = new WebviewPlugin({ name: 'builder', url: 'builder' }, { context, column: ViewColumn.Two });
    // ---------
    const inspector = new WebviewPlugin(inspectorProfile, { context, column: ViewColumn.Three, queueTimeout: 10000 });
    const template = new TemplatePlugin({ context });
    const project = new ProjectPlugin({ context, root });

    // const path = `${folder.uri.fsPath}/dist/ng-studio-test`
    // const local = new WebviewPlugin({ name: 'local', url: path }, { context, column: ViewColumn.Two });
    // local.setOptions({ devMode: true });  
  
    const manager = new PluginManager();
    const engine = new Engine(manager);
    engine.onload(() => {
      engine.register([ project, template, inspector ]);
      manager.activatePlugin([ 'project' ]);
    });

  }
}
