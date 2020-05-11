import { commands, ExtensionContext, ViewColumn, workspace, window } from 'vscode';
import { WebviewPlugin } from './app/webview';
import { ProjectPlugin } from './app/project';
import { HtmlTree } from './app/html-tree';

import { Engine, PluginManager } from '@remixproject/engine';

// On activation
export function activate(context: ExtensionContext) {
  // Register command "start" 
  const [ folder ] = workspace.workspaceFolders;
  if (folder) {  
    // const builder = new WebviewPlugin({ name: 'builder', url: '' }, { context, column: ViewColumn.One });
    const editor = new WebviewPlugin({ name: 'editor', url: 'editor' }, { context, column: ViewColumn.Two });
    const project = new ProjectPlugin({ name: 'project' }, { context, root: folder.uri.fsPath })

    const manager = new PluginManager();
    const engine = new Engine(manager);
    engine.onload(() => {
      engine.register([ editor, project ]);
      manager.activatePlugin([ 'editor', 'project' ]);
    });
    commands.registerCommand('ngStudio.start', async () => {
    });
  
    commands.registerCommand('ngStudio.select', (item) => {
      project.emit('select', item.node);
    })
  }

  	// Tree
  const tree = new HtmlTree(context);
  const view = window.createTreeView('ngTree', {
    treeDataProvider: tree
  })
}