import { Injectable } from '@angular/core';
import { PluginClient, connectClient } from '@remixproject/plugin';
import { HtmlNode } from 'ng-morph/template';
import { WebviewConnector } from './connector';
import { BehaviorSubject } from 'rxjs';
// import { DirectiveContext } from 'ngast/lib/directive-symbol';
import { DirectiveNode, DirectiveContext } from 'ng-morph/typescript';


@Injectable({ providedIn: 'root' })
export class InspectorClient extends PluginClient<any, any> {

  private node = new BehaviorSubject<HtmlNode>(null);
  public node$ = this.node.asObservable();

  private context = new BehaviorSubject<DirectiveContext>(null);
  public context$ = this.context.asObservable();

  constructor() {
    super();
    connectClient(new WebviewConnector(), this);
    this.onload(() => {
      this.on('project', 'selectDirective', (node: DirectiveNode) => this.context.next(node.context));
      this.on('template', 'selectNode', (node: HtmlNode) => this.node.next(node));
    })
  }

  setContext(context: DirectiveContext) {
    this.context.next(context);
  }

}