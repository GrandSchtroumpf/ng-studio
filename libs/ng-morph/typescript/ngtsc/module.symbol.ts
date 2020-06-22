import { Declaration, Node, isClassDeclaration } from 'typescript';
import { ClassDeclaration, Decorator } from '@angular/compiler-cli/src/ngtsc/reflection';
import { Trait, TraitState } from '@angular/compiler-cli/src/ngtsc/transform';
import { Reference } from '@angular/compiler-cli/src/ngtsc/imports';
import { isNgModuleTrait, hasDecoratorName } from './utils';
import { WorkspaceSymbols } from './workspace-symbols';
import { NgModuleAnalysis } from '@angular/compiler-cli/src/ngtsc/annotations/src/ng_module';

function findNgModule(node: Node) {
  let module: any;
  node.forEachChild(child => {
    if (isClassDeclaration(child) && hasDecoratorName(child, 'NgModule')) {
      module = child;
    }
  })
  return module;
}

export class ModuleSymbol {
  private ref: Reference<ClassDeclaration<Declaration>>;
  private _trait?: Trait<Decorator, NgModuleAnalysis, unknown>;

  /** Get the first NgModule found in the file with this path */
  static fromPath(workspace: WorkspaceSymbols, path: string) {
    const sf = workspace.program.getSourceFile(path);
    const node = findNgModule(sf);
    if (!node) {
      throw new Error('No @NgModule decorated class found for path: ' + path);
    }
    return new ModuleSymbol(workspace, node as ClassDeclaration);
  }

  constructor(
    private workspace: WorkspaceSymbols,
    private node: ClassDeclaration<Declaration>,
  ) {
    this.ref = new Reference(this.node);
  }

  get errors() {
    return this.trait?.state === TraitState.ERRORED ? this.trait.diagnostics : null;
  }

  get isAnalysed() {
    return this.trait?.state === TraitState.ANALYZED || this.trait?.state === TraitState.RESOLVED;
  }

  get record() {
    return this.workspace.traitCompiler.recordFor(this.node);
  }

  get metadata() {
    this.ensureAnalysis();
    return this.workspace.metaReader.getNgModuleMetadata(this.ref);
  }

  get scope() {
    this.ensureAnalysis();
    const scope = this.workspace.scopeRegistry.getScopeOfModule(this.node);
    return scope === 'error' ? null : scope;
  }

  get analysis() {
    this.ensureAnalysis();
    // As we analyzed the node above it should be ok...
    if (this.trait?.state === TraitState.ANALYZED || this.trait?.state === TraitState.RESOLVED) {
      return this.trait.analysis;
    }
  }

  public get trait() {
    if (!this._trait) {
      this._trait = this.record?.traits.find(trait => isNgModuleTrait(trait)) as any;
    }
    return this._trait;
  }

  private ensureAnalysis() {
    if (!this.record) {
      this.workspace.traitCompiler.analyzeNode(this.node);
      // @question: Should I run scopeRegistry.getCompilationScopes() here ???
      this._trait = this.record.traits.find(trait => isNgModuleTrait(trait)) as any;
    }
  }
}
