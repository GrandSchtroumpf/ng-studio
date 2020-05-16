import { commands, TreeDataProvider, window, workspace, ExtensionContext, TreeItem, TreeItemCollapsibleState, EventEmitter, TextDocument, Uri } from 'vscode';
import { Element, Node, Template } from '@angular/compiler/src/render3/r3_ast';
import { parseTemplate } from '@angular/compiler';
import { isElement, isTemplate } from 'ng-morph/template';
import { Plugin, PluginOptions, Profile } from '@remixproject/engine';

interface TreePluginOptions extends PluginOptions {
  context: ExtensionContext;
}

export class TemplatePlugin extends Plugin {
  private tree?: TemplateTree;
  protected options: TreePluginOptions;

  constructor(profile: Profile, options: Partial<TreePluginOptions>) {
    super(profile);
    this.setOptions(options);
  }
  
  onActivation() {
    this.tree = new TemplateTree(this.options.context);
    commands.registerCommand('template.selected', (node) => this.emit('selected', node));

    window.createTreeView('ngTree', {
      treeDataProvider: this.tree
    })
  }

  onDeactivation() {
    delete this.tree;
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
  private render = new EventEmitter<ElementItem>()
  onDidChangeTreeData = this.render.event;
  tree?: Node[];

  constructor(context: ExtensionContext) {
    const onEditorChange = window.onDidChangeActiveTextEditor(editor => this.update(editor.document));
    const onSave = workspace.onDidSaveTextDocument(document => this.update(document));
    if (window.activeTextEditor) {
      this.update(window.activeTextEditor.document);
    }
    context.subscriptions.push(onEditorChange, onSave);  
  }

  update(document: TextDocument) {
    if (document.languageId === 'html') {
      const fileName = document.fileName;
      const code = document.getText();
      this.tree = parseTemplate(code, fileName).nodes;
      this.render.fire();
    }
  }

  getTreeItem(element: ElementItem): ElementItem {
    return element;
  }

  getChildren(element: ElementItem): ElementItem[] {
    if (this.tree) {
      if (element) {
        return element.children.map((c: Tag) => new ElementItem(c));
      } else {
        return this.tree.filter(c => isTag(c)).map((c: Tag) => new ElementItem(c))
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
    arguments: [this.node],
    title: 'Selector node'
  }

  constructor(public node: Tag) {
    super(getName(node), getCollapseState(node));
    this.children = node.children.filter(c => isTag(c)) as any[];
  }

}