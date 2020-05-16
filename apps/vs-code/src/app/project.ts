import { window, workspace, ExtensionContext, TextDocument } from 'vscode';
import { Plugin, Profile, PluginOptions } from '@remixproject/engine';
import { join } from 'path';
import { Project, SourceFile } from 'ts-morph';

export function createProject(root: string) {
  const project = new Project();
  project.addSourceFilesFromTsConfig(join(root, 'tsconfig.json'));
  // const sourceFile = project.getSourceFile(currentPath());
  return project;
}

// function currentPath() {
//   return window.activeTextEditor.document.uri.fsPath;
// }
interface ProjectOptions extends PluginOptions {
  root: string;
  context: ExtensionContext;
}

export class ProjectPlugin extends Plugin {
  project: Project;
  sourceFile?: SourceFile;
  options: ProjectOptions;

  constructor(profile: Profile, options: ProjectOptions) {
    super(profile);
    this.project = new Project({ tsConfigFilePath: join(options.root, 'tsconfig.json') });
    this.options = options;
  }

  onActivation() {
    const onEditorChange = window.onDidChangeActiveTextEditor(editor => this.update(editor.document));
    const onSave = workspace.onDidSaveTextDocument(file => this.update(file));
    if (window.activeTextEditor) {
      this.update(window.activeTextEditor.document);
    }
    this.options.context.subscriptions.push(onEditorChange, onSave);  
  }

  update(document: TextDocument) {
    if (document.languageId === 'typescript') {
      if (this.sourceFile?.getFilePath() !== document.uri.fsPath) {
        this.sourceFile = this.project.getSourceFile(document.uri.fsPath);
      }
      const [structure] = this.getClasses();
      this.emit('change', structure);
    }
  }

  getClasses() {
    return this.sourceFile?.getClasses().map(c => c.getStructure());
  }
}