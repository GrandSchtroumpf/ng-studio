import { Injectable } from '@angular/core';
import { PluginClient } from '@remixproject/plugin';
import { createWebviewClient } from '@remixproject/plugin-vscode'
import { HtmlNode } from 'ng-morph/template';
import { BehaviorSubject } from 'rxjs';
import { DirectiveNode, DirectiveContext } from 'ng-morph/typescript';


@Injectable({ providedIn: 'root' })
export class InspectorClient extends PluginClient<any, any> {

  private node = new BehaviorSubject<HtmlNode>(null);
  public node$ = this.node.asObservable();

  private context = new BehaviorSubject<DirectiveContext>(null);
  public context$ = this.context.asObservable();

  constructor() {
    super();
    createWebviewClient(this)
    this.onload(() => {
      this.on('project', 'selectDirective', (node: DirectiveNode) => this.context.next(node.context));
      this.on('template', 'selectNode', (node: HtmlNode) => this.node.next(node));
    })
  }

  setContext(context: DirectiveContext) {
    this.context.next(context);
  }

}