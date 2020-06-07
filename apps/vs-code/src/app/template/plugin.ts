import { Plugin, PluginOptions } from '@remixproject/engine';
import { ExtensionContext, Disposable, commands, window, TreeView } from 'vscode';
import { TemplateTree, ElementItem } from './tree';
import { TemplateHost, getTemplateHost, HtmlNode } from 'ng-morph/template';
import { CompileTemplateMetadata } from '@angular/compiler';

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
  node?: HtmlNode;

  constructor(options: Partial<TreePluginOptions>) {
    super({ name: 'template' });
    this.setOptions(options);
  }
  
  onActivation() {
    this.tree = new TemplateTree();
    const treeView = window.createTreeView('templateTree', { treeDataProvider: this.tree });
    const selected = commands.registerCommand('template.selected', (item) => this.selectNode(item));
    this.listeners = [ treeView, selected ];
  }

  onDeactivation() {
    this.listeners.forEach(listener => listener.dispose());
  }

  init(metadata: CompileTemplateMetadata) {
    this.metadata = metadata;
    if (metadata.template) {
      this.host = getTemplateHost(metadata.template);
      const ast = this.host.getAst();
      this.tree.setAst(ast.nodes);
    }
  }

  /** Select an item & emit the node */
  async selectNode(node: HtmlNode) {
    this.node = node;
    this.call('inspector', 'select', node);
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

  // /** Update the selected node */
  // async updateNode(node: Partial<Element>) {
  //   if (this.item && this.filePath) {
  //     this.item.update(node);
  //     const code = printTemplateAst({ nodes: this.ast });
  //     await fs.writeFile(this.filePath, code);
  //     this.tree.setAst(this.ast);
  //     this.tree.render.fire();
  //   }
  // }
}