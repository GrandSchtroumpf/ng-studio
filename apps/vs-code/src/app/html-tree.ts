import { TreeDataProvider, window, workspace, ExtensionContext, TreeItem, TreeItemCollapsibleState, EventEmitter, TextDocument, Uri } from 'vscode';
import { Element, Node, Template, Text } from '@angular/compiler/src/render3/r3_ast';
import { parseTemplate } from '@angular/compiler';

type Tag = Element | Template;

function isElement(node: Node): node is Element {
  return 'name' in node;
}

function isTemplate(node: Node): node is Template {
  return 'tagName' in node;
}

function isTag(node: Node): node is Tag {
  return isElement(node) || isTemplate(node);
}

function isText(node: Node): node is Text {
  return 'value' in node && !('name' in node)
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

export class HtmlTree implements TreeDataProvider<ElementItem> {
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
    command: 'ngStudio.select',
    arguments: [this],
    title: 'Selector node'
  }

  constructor(public node: Tag) {
    super(getName(node), getCollapseState(node));
    this.children = node.children.filter(c => isTag(c)) as any[];
  }

}