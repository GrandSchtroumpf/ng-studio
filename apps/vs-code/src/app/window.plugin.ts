import { Plugin, Profile } from '@remixproject/engine';
import { window, OpenDialogOptions, workspace } from 'vscode';
import { relative } from 'path';

export const windowProfile: Profile = {
  name: 'window',
  methods: ['alert', 'warning', 'error', 'prompt', 'select', 'selectFile', 'selectFolder'],
}

interface IWindowPlugin {
  /** Display an input window */
  prompt(): Thenable<string>
  /** Display a select window */
  select(options: string[]): Thenable<string>
  /** Display a select window with local file system: can only select a file */
  selectFile(options?: Partial<DialogOptions>): Thenable<string>
  /** Display a select window with local file system: can only select a folder */
  selectFolder(options?: Partial<DialogOptions>): Thenable<string>
  /** Display a message with actions button. Returned the button clicked if any */
  alert(message: string, actions?: string[]): Thenable<string>
  /** Display a warning message with actions button. Returned the button clicked if any */
  warning(message: string, actions?: string[]): Thenable<string>
  /** Display an error message with actions button. Returned the button clicked if any */
  error(message: string, actions?: string[]): Thenable<string>
}

const formats = {
  images: ['png', 'webp', 'jpg', 'jpeg', 'svg'],
  javascript: ['js', 'jsx', 'ts', 'tsx'],
}
interface DialogOptions {
  relative: boolean;
  multiple: boolean;
  formats: (keyof typeof formats)[];
}

function getDialogOptions(options: Partial<DialogOptions>, dialogOptions: OpenDialogOptions): OpenDialogOptions {
  const filters = {};
  options.formats?.forEach(name => filters[name] = formats[name]);
  return {
    filters,
    defaultUri: workspace.workspaceFolders[0].uri,
    canSelectMany: options.multiple ?? false,
    ...dialogOptions
  }
}


export class WindowPlugin extends Plugin implements IWindowPlugin {

  constructor() {
    super(windowProfile)
  }

  prompt(label?: string, type: 'password' | 'text' = 'text') {
    const password  = type === 'password';
    return window.showInputBox({ prompt: label, password });
  }

  select(options: string[]) {
    return window.showQuickPick(options);
  }

  async selectFile(options: Partial<DialogOptions> = {}) {
    const dialogOptions = getDialogOptions(options, { canSelectFiles: true });
    const [file] = await window.showOpenDialog(dialogOptions);
    const path = file.fsPath;
    return options.relative
      ? relative(dialogOptions.defaultUri.fsPath, path)
      : path;
  }

  async selectFolder(options: Partial<DialogOptions> = {}) {
    const dialogOptions = getDialogOptions(options, { canSelectFolders: true });
    const [file] = await window.showOpenDialog(dialogOptions);
    const path = file.fsPath;
    return options.relative
      ? relative(dialogOptions.defaultUri.fsPath, path)
      : path;
  }

  alert(message: string, actions: string[] = []) {
    return window.showInformationMessage(message, ...actions);
  }

  error(message: string, actions: string[] = []) {
    return window.showErrorMessage(message, ...actions);
  }

  warning(message: string, actions: string[] = []) {
    return window.showWarningMessage(message, ...actions); 
  }

}