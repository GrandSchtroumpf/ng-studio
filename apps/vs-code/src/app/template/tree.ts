import { TreeDataProvider, EventEmitter, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';
import { TagNode, HtmlNode, isContentNode, ElementNode, ContentNode, isTextNode } from 'ng-morph/template';

function getName(node: ContentNode | ElementNode) {
  return isContentNode(node)
    ? 'ng-content'
    : node.name;
}

function getCollapseState(node: ElementNode) {
  return node.children?.some(c => !isTextNode(c))
    ? TreeItemCollapsibleState.Collapsed
    : TreeItemCollapsibleState.None;
}

export class TemplateTree implements TreeDataProvider<TagNode> {
  public render = new EventEmitter<TagNode>();
  onDidChangeTreeData = this.render.event;
  elements: Record<string, ElementItem> = {};
  ast?: HtmlNode[];

  setAst(ast: HtmlNode[]) {
    this.ast = ast;
    this.render.fire(undefined);
  }

  getTreeItem(element: TagNode): ElementItem {
    return new ElementItem(element);
  }

  getChildren(element: TagNode): TagNode[] {
    if (this.ast) {
      if (element) {
        return element.children?.filter(node => !isTextNode(node)) || [] as any[];
      } else {
        return this.ast.filter(c => !isTextNode(c)) as any[];
      }
    }
  }

  getParent(node: TagNode): TagNode {
    throw new Error('This method should be implemented by the template plugin');
  }
}

export class ElementItem extends TreeItem {
  public iconPath: Uri | string;
  public description: string;
  public contextValue = 'element'; // use to have specific actions on items
  public tooltip = 'Some tooltip';
  public command = {
    command: 'template.select',
    arguments: [this.node],
    title: 'Selector node'
  }

  constructor(public node: TagNode) {
    super(getName(node), getCollapseState(node));
  }
}