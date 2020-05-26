import { ExtensionContext, ViewColumn, workspace } from 'vscode';
import { WebviewPlugin } from './app/webview';

import { Engine, PluginManager } from '@remixproject/engine';
import { TemplatePlugin } from './app/template.plugin';
import { VscodePlugin } from './app/vscode.plugin';

// On activation
export function activate(context: ExtensionContext) {
  // Register command "start" 
  const [ folder ] = workspace.workspaceFolders;
  if (folder) {  
    // const project = new ProjectPlugin({ name: 'project' }, { context, root: folder.uri.fsPath })
    // const builder = new WebviewPlugin({ name: 'builder', url: 'builder' }, { context, column: ViewColumn.Two });
    const inspector = new WebviewPlugin({ name: 'inspector', url: `inspector`, methods: ['updateNode'] }, { context, column: ViewColumn.Three });
    const template = new TemplatePlugin({ name: 'template' }, { context });

    const path = `${folder.uri.fsPath}/dist/ng-studio-test`
    const local = new WebviewPlugin({ name: 'local', url: path }, { context, column: ViewColumn.Two });
    local.setOptions({ devMode: true });  
  
    const manager = new PluginManager();
    const engine = new Engine(manager);
    engine.onload(() => {
      engine.register([ template, local, inspector ]);
      manager.activatePlugin([ 'template', 'local', 'inspector' ]);
    });
  }
}