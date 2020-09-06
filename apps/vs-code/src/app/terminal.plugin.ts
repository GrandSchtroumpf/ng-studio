import { Plugin } from "@remixproject/engine";
import { window, ShellExecution, Task } from 'vscode';

interface TerminalOptions {

}

export class TerminalPlugin extends Plugin {

  constructor() {
    super({ name: 'terminal', methods: ['write'] })
  }

  get active() {
    return window.activeTerminal;
  }

  exec(command: string) {
    new ShellExecution(command);
  }

  write(text: string, addLine = false) {
    
  }
}