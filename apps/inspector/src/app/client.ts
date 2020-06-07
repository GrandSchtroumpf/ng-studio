import { Injectable } from '@angular/core';
import { PluginClient, connectClient } from '@remixproject/plugin';
import { HtmlNode } from 'ng-morph/template';
import { WebviewConnector } from './connector';
import { BehaviorSubject } from 'rxjs';
import { DirectiveContext } from 'ngast/lib/directive-symbol';


@Injectable({ providedIn: 'root' })
export class InspectorClient extends PluginClient<any, any> {

  private node = new BehaviorSubject<HtmlNode>(null);
  public node$ = this.node.asObservable();

  private context = new BehaviorSubject<DirectiveContext>(null);
  public context$ = this.context.asObservable();

  constructor() {
    super();
    connectClient(new WebviewConnector(), this);
  }

  setContext(context: DirectiveContext) {
    this.context.next(context);
  }

  select(node: HtmlNode) {
    this.node.next(node);
  }
}