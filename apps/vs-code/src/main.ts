import { commands, ExtensionContext, window } from 'vscode';
import { createWebiew } from './app/webview';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

  commands.registerCommand('start', () => {
    window.showInformationMessage('Hello World');
  })

	// Commands
	commands.registerCommand('ngStudio.start', () => {
    const webviewPanel = createWebiew(context.extensionPath);
    context.subscriptions.push(webviewPanel);
  })

}

// this method is called when your extension is deactivated
export function deactivate() {}