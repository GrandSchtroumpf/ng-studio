import { commands, ExtensionContext, ViewColumn } from 'vscode';
import { createWebview } from './app/webview';

// On activation
export function activate(context: ExtensionContext) {
  // Register command "start" 
  commands.registerCommand('start', async () => {
    const builder = createWebview(context.extensionPath, 'builder', ViewColumn.One);
    const editor = createWebview(context.extensionPath, 'editor', ViewColumn.Two);
    context.subscriptions.push(builder);
    context.subscriptions.push(editor);
  })
}