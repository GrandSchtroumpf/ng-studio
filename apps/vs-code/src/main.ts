import { ExtensionContext, ViewColumn, workspace } from 'vscode';
import { WebviewPlugin } from './app/webview';

import { Engine, PluginManager } from '@remixproject/engine';
import { WindowPlugin } from './app/window.plugin';

import { ProjectPlugin } from './app/project/plugin';
import { TemplatePlugin } from './app/template/plugin';
import { StylesheetPlugin } from './app/stylesheet/plugin';

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

    const inspector = new WebviewPlugin(inspectorProfile, { context, column: ViewColumn.Two });
    const styleEditor = new WebviewPlugin(styleEditorProfile, { context, column: ViewColumn.Two });
    const template = new TemplatePlugin({ context });
    const stylesheet = new StylesheetPlugin();
    const project = new ProjectPlugin({ context, root });

    const path = `${root}/dist/ng-studio-test`
    const local = new WebviewPlugin({ ...localProfile, url: path }, { context, column: ViewColumn.One });
    local.setOptions({ devMode: true });  
  
    const manager = new PluginManager();
    const engine = new Engine(manager);
    const window = new WindowPlugin();
    
    engine.onload(() => {
      engine.register([ project, template, stylesheet, styleEditor, local, inspector, window ]);
      manager.activatePlugin([ 'project', 'template', 'stylesheet', 'styleEditor', 'local', 'inspector', 'window' ]);
    });
  }
}
