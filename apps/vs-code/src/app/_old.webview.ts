import { Profile, ExternalProfile, PluginConnector, Message, PluginConnectorOptions } from '@remixproject/engine';
import { window, ViewColumn, Uri, ExtensionContext, WebviewPanel } from 'vscode';
import { environment } from '../environments/environment';
import { promises as fs, watch } from 'fs';
import { join } from 'path';

export function createWebview(extensionPath: string, name: string, column: ViewColumn) {
  const panel = window.createWebviewPanel(
    name,
    name,
    column,
    {
      enableScripts: true,
      localResourceRoots: [Uri.file(join(extensionPath, name))]
    });
  
  const index = join(extensionPath, name, 'index.html');
  
  const matchLinks = /(href|src)="([^"]*)"/g;
  const toUri = (_: any, prefix: 'href' | 'src', link: string) => {
    // For <base href="#" />
    if (link === '#') {
      return `${prefix}="${link}"`;
    }
    // For scripts & links
    const path = join(extensionPath, name, link);
    const uri = Uri.file(path);
    return `${prefix}="${panel.webview['asWebviewUri'](uri)}"`;
  };
  
  // Refresh the webview on update from the code
  const updateWebview = async () => {
    const html = await fs.readFile(index, 'utf-8');
    panel.webview.html = html.replace(matchLinks, toUri);
  }
  
  // If dev mode update on change
  if (!environment.production) {
    watch(index).on('change', updateWebview)
  }
  updateWebview();
  return panel;
}


//////////////////////////////////
// ---------- PLUGIN ---------- //
//////////////////////////////////


interface WebviewOptions extends PluginConnectorOptions {
  /** Extension Path */
  context: ExtensionContext;
  column: ViewColumn;
}

export class WebviewPlugin extends PluginConnector {
  panel?: WebviewPanel;
  options: WebviewOptions;

  constructor(profile: Profile & ExternalProfile, options: WebviewOptions) {
    super(profile);
    this.options = options;
  }

  protected send(message: Partial<Message>): void {
    if (this.panel) {
      this.panel.webview.postMessage(message);
    }
  }

  protected connect(url: string): void {
    const { extensionPath } = this.options.context;
    this.panel = createWebview(extensionPath, this.name, this.options.column);
    this.panel.webview.onDidReceiveMessage(msg => this.getMessage(msg));
    this.options.context.subscriptions.push(this.panel);
  }

  protected disconnect(): void {
    if (this.panel) {
      this.panel.dispose();
    }
  }

}
