import { commands, TreeDataProvider, window, workspace, ExtensionContext, TreeItem, TreeItemCollapsibleState, EventEmitter, TextDocument, Uri, TreeView, Disposable } from 'vscode';
import { Element, Node, Template } from '@angular/compiler/src/render3/r3_ast';
import { parseTemplate } from '@angular/compiler';
import { isElement, isTemplate, printTemplateAst } from 'ng-morph/template';
import { Plugin, PluginOptions, Profile } from '@remixproject/engine';
import { promises as fs } from 'fs';

interface TreePluginOptions extends PluginOptions {
  context: ExtensionContext;
}

export class TemplatePlugin extends Plugin {
  private listeners: Disposable[] = [];
  protected options: TreePluginOptions;
  methods = ['updateNode', 'updateAst'];
  filePath?: string;
  ast?: Node[];
  tree?: TemplateTree;
  item?: ElementItem;

  constructor(profile: Profile, options: Partial<TreePluginOptions>) {
    super(profile);
    this.setOptions(options);
  }
  
  onActivation() {
    this.tree = new TemplateTree();
    this.listeners = [
      window.createTreeView('templateTree', { treeDataProvider: this.tree }),
      window.onDidChangeActiveTextEditor(editor => this.updateAst(editor?.document)),
      workspace.onDidSaveTextDocument(document => this.updateAst(document)),
      commands.registerCommand('template.selected', (item) => this.selectNode(item)),
    ];
    if (window.activeTextEditor) {
      this.updateAst(window.activeTextEditor.document);
    }
  }

  onDeactivation() {
    this.listeners.forEach(listener => listener.dispose());
  }

  /** Select an item & emit the node */
  async selectNode(item: ElementItem) {
    this.item = item;
    this.emit('selected', item.node);
  }

  /** Update the whole current AST */
  async updateAst(document: TextDocument) {
    if (document?.languageId === 'html') {
      const fileName = document.fileName;
      const code = document.getText();
      this.filePath = document.uri.fsPath;
      this.ast = parseTemplate(code, fileName).nodes;
      this.tree.setAst(this.ast);
      this.tree.render.fire();
    }
  }

  /** Update the selected node */
  async updateNode(node: Partial<Element>) {
    if (this.item && this.filePath) {
      this.item.update(node);
      const code = printTemplateAst({ nodes: this.ast });
      await fs.writeFile(this.filePath, code);
      this.tree.setAst(this.ast);
      this.tree.render.fire();
    }
  }
}




type Tag = Element | Template;

function isTag(node: Node): node is Tag {
  return isElement(node) || isTemplate(node);
}

function getName(node: Tag) {
  return isElement(node)
    ? node.name
    : node.templateAttrs[0].name;
}

function getCollapseState(node: Tag) {
  return node.children.some(c => isTag(c))
    ? TreeItemCollapsibleState.Collapsed
    : TreeItemCollapsibleState.None;
}

export class TemplateTree implements TreeDataProvider<ElementItem> {
  public render = new EventEmitter<ElementItem>()
  onDidChangeTreeData = this.render.event;
  ast?: Node[];

  setAst(ast: Node[]) {
    this.ast = ast;
  }

  getTreeItem(element: ElementItem): ElementItem {
    return element;
  }

  getChildren(element: ElementItem): ElementItem[] {
    if (this.ast) {
      if (element) {
        return element.children.map((c: Tag) => new ElementItem(c));
      } else {
        return this.ast.filter(c => isTag(c)).map((c: Tag) => new ElementItem(c))
      }
    }
  }
}

class ElementItem extends TreeItem {
  public children: Tag[];
  public iconPath: Uri | string;
  public description: string;
  public contextValue: string; // use to have specific actions on items
  public tooltip = 'Some tooltip';
  public command = {
    command: 'template.selected',
    arguments: [this],
    title: 'Selector node'
  }

  constructor(public node: Tag) {
    super(getName(node), getCollapseState(node));
    this.children = node.children.filter(c => isTag(c)) as any[];
  }

  update(node: Partial<Tag>) {
    for (const key in node) {
      this.node[key] = node[key];
    }
  }

}