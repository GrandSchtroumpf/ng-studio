import { Plugin } from '@remixproject/engine';
import { window, Uri, ExtensionContext } from 'vscode';
import { relative } from 'path';
import { WebviewPlugin } from './webview';

export class VscodePlugin extends Plugin {

  document: string;

  constructor() {
    super({ name: 'vscode' });
  }
  
  activate() {
    this.document = window.activeTextEditor?.document?.uri.fsPath;
    this.emit('focus', this.document);
    window.onDidChangeActiveTextEditor(editor => {
      this.document = editor?.document?.uri.fsPath; // Maybe pass the URI to the plugin
      this.emit('focus', this.document);
    });
    super.activate();
  }
}