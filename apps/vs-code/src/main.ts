import { commands, ExtensionContext, ViewColumn, workspace, window } from 'vscode';
import { WebviewPlugin } from './app/webview';
import { ProjectPlugin } from './app/project';
import { HtmlTree } from './app/html-tree';

import { Engine, PluginManager } from '@remixproject/engine';
import { TemplatePlugin } from './app/template.plugin';

// On activation
export function activate(context: ExtensionContext) {
  // Register command "start" 
  const [ folder ] = workspace.workspaceFolders;
  if (folder) {  
    // const builder = new WebviewPlugin({ name: 'builder', url: '' }, { context, column: ViewColumn.One });
    // const project = new ProjectPlugin({ name: 'project' }, { context, root: folder.uri.fsPath })
    const template = new TemplatePlugin({ name: 'template' }, { context });
    const inspector = new WebviewPlugin({ name: 'inspector', url: 'inspector' }, { context, column: ViewColumn.Two });

    const manager = new PluginManager();
    const engine = new Engine(manager);
    engine.onload(() => {
      engine.register([ inspector, template ]);
      manager.activatePlugin([ 'inspector', 'template' ]);
    });
  }

  // 	// Tree
  // const tree = new HtmlTree(context);
  // const view = window.createTreeView('ngTree', {
  //   treeDataProvider: tree
  // })
}