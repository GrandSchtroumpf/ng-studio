import { ProjectSymbols, ModuleSymbol, DirectiveSymbol } from 'ngast';
import { CompileDirectiveSummary, CompilePipeSummary } from '@angular/compiler';
import { ClassDeclaration, isMethodDeclaration, isPropertyDeclaration, MethodDeclaration, PropertyDeclaration } from 'typescript';

export class ComponentHost {
  node: ClassDeclaration
  components: Record<string, CompileDirectiveSummary> = {};
  pipes: Record<string, CompilePipeSummary> = {};

  constructor(private symbol: DirectiveSymbol) {
    this.node = this.symbol.getNode();
    const { directives, pipes } = this.symbol.getDirectiveContext();
    for (const directive of directives) {
      this.components[directive.selector] = directive;
    }
    this.node = this.symbol.getNode();
    for (const pipe of pipes) {
      this.pipes[pipe.name] = pipe;
    }
  }

  getSelectors() {
    return this.symbol.getDirectiveContext().directives.map(ctx => ctx.selector);
  }

  getContext(selector: string) {
    return this.components[selector];
  }

  getMethods() {
    const methods: Method[] = [];
    for (const node of this.node.members) {
      if (isMethodDeclaration(node)) {
        methods.push(new Method(node));
      }
    }
    return methods; // this.node.members.filter(member => isMethodDeclaration(member)).map(node => new Method(node))
  }

  getProperties() {
    const methods: Property[] = [];
    for (const node of this.node.members) {
      if (isPropertyDeclaration(node)) {
        methods.push(new Property(node));
      }
    }
    return methods;
  }
}


class Method {
  constructor(private node: MethodDeclaration) {}
  get name() {
    return this.node.name.getText();
  }
}

class Property {
  constructor(private node: PropertyDeclaration) {}
  get name() {
    return this.node.name.getText();
  }
}