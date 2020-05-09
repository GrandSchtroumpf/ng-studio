import { window, ViewColumn, Uri, Webview } from 'vscode';
import { promises as fs, watch } from 'fs';
import { join } from 'path';
import { environment } from '../environments/environment';

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
  const toUri = (_, prefix: 'href' | 'src', link: string) => {
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