import { TreeDataProvider, EventEmitter, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { ModuleSymbol, DirectiveSymbol } from 'ngast';


function isOwnModule(module: ModuleSymbol) {
  return !module.getModuleSummary().type.reference.filePath.includes('node_modules');
}

type SymbolNode = (ModuleSymbol | DirectiveSymbol);

function isModuleSymbol(symbol: SymbolNode): symbol is ModuleSymbol {
  return 'getModuleSummary' in symbol;
}

export class ModuleTree implements TreeDataProvider<SymbolNode> {
  public render = new EventEmitter<SymbolNode>()
  onDidChangeTreeData = this.render.event;
  modules: ModuleSymbol[];

  constructor(modules: ModuleSymbol[]) {
    this.modules = modules;
  }

  setModules(modules: ModuleSymbol[]) {
    this.modules = modules;
  }

  getTreeItem(symbol: SymbolNode): ModuleItem | DirectiveItem {
    return isModuleSymbol(symbol)
      ? new ModuleItem(symbol)
      : new DirectiveItem(symbol);
  }

  getChildren(symbol?: SymbolNode): SymbolNode[] {
    if (symbol) {
      return isModuleSymbol(symbol)
        ? symbol.getExportedDirectives()
        : [];
    } else {
      return this.modules.filter(isOwnModule);
    }
  }
}

////////////
// MODULE //
////////////

function getModuleName(symbol: ModuleSymbol) {
  return symbol.getModuleSummary().type.reference.name;
}

function getCollapseState(symbol: ModuleSymbol) {
  return symbol.getExportedDirectives().length
    ? TreeItemCollapsibleState.Collapsed
    : TreeItemCollapsibleState.None;
}

class ModuleItem extends TreeItem {
  public command = {
    command: 'module.selected',
    arguments: [this.symbol],
    title: 'Select Module'
  }
  constructor(public symbol: ModuleSymbol) {
    super(getModuleName(symbol), getCollapseState(symbol))
  }
}

///////////////
// DIRECTIVE //
///////////////

function getName(symbol: DirectiveSymbol) {
  return symbol.getNonResolvedMetadata().type.reference.name || 'No Name';
}
function getSelector(symbol: DirectiveSymbol) {
  return symbol.getNonResolvedMetadata().selector || 'No Selector';
}

class DirectiveItem extends TreeItem {
  public description = getName(this.symbol);
  public command = {
    command: 'directive.selected',
    arguments: [this.symbol],
    title: 'Select Directive'
  }
  constructor(public symbol: DirectiveSymbol) {
    super(getSelector(symbol))
  }
}