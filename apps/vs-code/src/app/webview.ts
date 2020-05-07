import { window, ViewColumn, Uri, Webview } from 'vscode';
import { join } from 'path';

const webviewPath = 'studio';

export function createWebiew(extensionPath: string) {
  const panel = window.createWebviewPanel(
    'studio', // Identifies the type of the webview. Used internally
    'Studio', // Title of the panel displayed to the user
    ViewColumn.Active, // Editor column to show the new webview panel in.
    {
      retainContextWhenHidden: true,
      enableScripts: true,
      localResourceRoots: [Uri.file(join(extensionPath, webviewPath))]
    }
  );

  // HTML
  panel.webview.html = getIframeHtml(panel.webview, extensionPath);
  return panel;
}

/** 
 * Create an Iframe HTML with correct links
 */
function getIframeHtml(webview: Webview, extensionPath: string) {
  const getUri = (fileName: string) => {
    const uri = Uri.file(join(extensionPath, webviewPath, fileName));
    return webview['asWebviewUri'](uri);
  }

  // Style
  const linkNames = ['styles'];
  const links = linkNames.map(link => `<link rel="stylesheet" href="${getUri(`${link}.css`)}">`);

  // Script
  const scriptNames = ['runtime', 'polyfills', 'main'];
  const scripts = scriptNames.map(script => `<script src="${getUri(`${script}.js`)}" type="module"></script>`);

  // HTML
  return `<!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="utf-8" />
    <title>Studio</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    ${links.join('')}
  </head>
  
  <body>
    <h1>Hello World</h1>
    <studio-root></studio-root>
    ${scripts.join('')}
  </body>
  
  </html>`
}