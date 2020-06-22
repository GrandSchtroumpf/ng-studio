import { ExtensionContext, ViewColumn, workspace } from 'vscode';
import { WebviewPlugin } from './app/webview';

import { Engine, PluginManager } from '@remixproject/engine';
import { WindowPlugin } from '@remixproject/engine-vscode';

import { ProjectPlugin } from './app/project/plugin';
import { TemplatePlugin } from './app/template/plugin';

const inspectorProfile = {
  name: 'inspector',
  url: 'inspector',
  methods: ['select', 'setContext', 'updateNode'],
};

const localProfile = {
  name: 'local',
  methods: ['setName']
}

// On activation
export async function activate(context: ExtensionContext) {
  // Register command "start" 
  const [ folder ] = workspace.workspaceFolders;
  if (folder) {  
    const root = folder.uri.fsPath;

    const inspector = new WebviewPlugin(inspectorProfile, { context, column: ViewColumn.Three });
    const template = new TemplatePlugin({ context });
    const project = new ProjectPlugin({ context, root });

    const path = `${root}/dist/ng-studio-test`
    const local = new WebviewPlugin({ ...localProfile, url: path }, { context, column: ViewColumn.One });
    local.setOptions({ devMode: true });  
  
    const manager = new PluginManager();
    const engine = new Engine(manager);
    const window = new WindowPlugin();
    
    engine.onload(() => {
      engine.register([ project, template, inspector, local, window ]);
      manager.activatePlugin([ 'project', 'template', 'local', 'inspector', 'window' ]);
    });
  }
}
