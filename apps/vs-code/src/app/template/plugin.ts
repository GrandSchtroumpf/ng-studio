import { Plugin, PluginOptions } from '@remixproject/engine';
import { ExtensionContext, Disposable, commands, window, TreeView } from 'vscode';
import { TemplateTree, ElementItem } from './tree';
import { TemplateHost, getTemplateHost, HtmlNode } from 'ng-morph/template';
import { CompileTemplateMetadata } from '@angular/compiler';
import { promises as fs, watch } from 'fs';
import { DirectiveNode } from 'ng-morph/typescript';

interface TreePluginOptions extends PluginOptions {
  context: ExtensionContext;
}

export class TemplatePlugin extends Plugin {
  private listeners: Disposable[] = [];
  protected options: TreePluginOptions;
  methods = ['init', 'selectNode', 'updateNode', 'updateAst'];
  metadata?: CompileTemplateMetadata;
  host?: TemplateHost;
  filePath?: string;
  ast?: Node[];
  treeView?: TreeView<ElementItem>;
  tree?: TemplateTree;

  constructor(options: Partial<TreePluginOptions>) {
    super({ name: 'template' });
    this.setOptions(options);
  }
  
  onActivation() {
    this.tree = new TemplateTree();
    const treeView = window.createTreeView('templateTree', { treeDataProvider: this.tree });
    const selected = commands.registerCommand('template.selected', (item) => this.selectNode(item));
    this.listeners = [ treeView, selected ];
    this.on('project', 'selectDirective', (node: DirectiveNode) => {
      this.init(node.templateMetadata);
    });
  }

  onDeactivation() {
    this.listeners.forEach(listener => listener.dispose());
  }

  init(metadata: CompileTemplateMetadata) {
    this.metadata = metadata;
    if (metadata.templateUrl) {
      const update = async () => {
        const code = await fs.readFile(metadata.templateUrl, 'utf-8');
        this.host = getTemplateHost(code); 
        const ast = this.host.getAst();
        this.emit('selectAst', ast);
        this.tree.setAst(ast.nodes);
      }
      watch(metadata.templateUrl, 'utf-8', () => update());
      update();
    }
  }

  /** Select an item & emit the node */
  async selectNode(node: HtmlNode) {
    this.emit('selectNode', node);
    // this.call('inspector', 'select', node);
  }

  // /** Update the whole current AST */
  // async updateAst(document: TextDocument) {
  //   if (document?.languageId === 'html') {
  //     const fileName = document.fileName;
  //     const code = document.getText();
  //     this.filePath = document.uri.fsPath;
  //     this.ast = parseTemplate(code, fileName).nodes;
  //     this.emit('ast', this.ast);
  //     this.tree.setAst(this.ast);
  //     this.tree.render.fire();
  //   }
  // }

  /** Update the selected node */
  async updateNode(node: Partial<Element>) {
    if (this.host) {
      this.host.update(node, node.id);
      const code = this.host.print();
      const path = this.metadata.templateUrl;
      await fs.writeFile(path, code);
      this.tree.render.fire();
    }
  }
}