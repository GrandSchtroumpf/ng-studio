import { Plugin, PluginOptions } from '@remixproject/engine';
import { ExtensionContext, Disposable, commands, window, TreeView } from 'vscode';
import { TemplateTree } from './tree';
import { TemplateHost, getTemplateHost, HtmlNode, elementNode, TagNode, getParentAndIndex, AttributeNode, textNode, isElementNode } from 'ng-morph/template';
import { promises as fs, watch } from 'fs';
import { DirectiveNode, ComponentState } from 'ng-morph/typescript';
import { Node } from '@angular/compiler/src/render3/r3_ast';

interface TreePluginOptions extends PluginOptions {
  context: ExtensionContext;
}

export class TemplatePlugin extends Plugin {
  private listeners: Disposable[] = [];
  protected options: TreePluginOptions;
  private directiveNode: DirectiveNode;
  methods = ['init', 'remove', 'add', 'selectNode', 'updateNode', 'updateAst'];
  state: ComponentState;
  templateUrl?: string;
  host?: TemplateHost;
  filePath?: string;
  ast?: Node[];
  treeView?: TreeView<TagNode>;
  tree?: TemplateTree;

  constructor(options: Partial<TreePluginOptions>) {
    super({ name: 'template' });
    this.setOptions(options);
  }
  
  onActivation() {
    this.tree = new TemplateTree();
    this.treeView = window.createTreeView('templateTree', { treeDataProvider: this.tree });
    const select = commands.registerCommand('template.select', (item) => this.selectNode(item));
    const remove = commands.registerCommand('template.remove', (node: HtmlNode) => this.remove(node.id));
    const addChild = commands.registerCommand('template.add', (parent: HtmlNode) => this.add(parent));
    this.listeners = [ this.treeView, select, remove, addChild ];
    this.on('workspace', 'selectComponent', (state: ComponentState) => {
      this.state = state;
      this.templateUrl = state.template.templateUrl;
      if (this.templateUrl) {
        const update = async () => {
          const code = await fs.readFile(this.templateUrl, 'utf-8');
          this.host = getTemplateHost(code); 
          const ast = this.host.getAst();
          this.emit('selectAst', ast);
          this.tree.setAst(ast.nodes);
        }
        watch(this.templateUrl, 'utf-8', () => update());
        update();
      }
    });

    // Assign selectParet on treeView
    this.tree.getParent = (node: TagNode) => {
      const [ parentId ] = getParentAndIndex(node.id);
      return this.host.getNode(parentId);
    }
  }

  onDeactivation() {
    this.listeners.forEach(listener => listener.dispose());
  }

  private async save() {
    const code = this.host.print();
    await fs.writeFile(this.templateUrl, code);
    this.tree.render.fire(undefined);
  }

  async add(parent: HtmlNode) {
    const options = this.state.selectorScope;
    const base = ['h1', 'button', 'input'];
    const selector: string = await this.call('window', 'select', [ ...base, ...options ]);

    // Get attributes in []
    // TODO: find a cleaner way to extract content of []
    const attributeNames = selector.match(/(?<=\[).+?(?=\])/g) || [];
    const attributes = attributeNames.map(name => ({ name, value: '' } as AttributeNode));
    // TODO: find a cleaner way to get the name
    const name = selector.split('[').shift();
    // Add text
    const children = ['h1', 'button'].includes(name)
      ? [textNode(name)]
      : [];
    const node = elementNode({ name, attributes, children });
    this.host.push(node, parent.id);
    this.save();
  }

  async remove(id: string) {
    const [parentId] = getParentAndIndex(id);
    const parent = this.host.getNode(parentId);
    this.host.delete(id);
    this.save();
    this.emit('deleteNode', id);
    if (parent && isElementNode(parent)) {
      this.selectNode(parent);
    } else {
      this.emit('selectNode', null);
    }
  }

  /** Select an item & emit the node */
  async selectNode(node: TagNode) {
    await this.call('manager', 'activatePlugin', 'inspector');
    this.treeView.reveal(node);
    this.emit('selectNode', node);
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
      await fs.writeFile(this.templateUrl, code);
      this.tree.render.fire(undefined);
    }
  }
}