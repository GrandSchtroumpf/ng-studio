import { Injectable } from '@angular/core';
import { PluginClient, connectClient } from '@remixproject/plugin';
import { HtmlNode } from 'ng-morph/template';
import { WebviewConnector } from './connector';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InspectorClient extends PluginClient<any> {

  private node = new BehaviorSubject(null);
  public node$ = this.node.asObservable();

  constructor() {
    super();
    connectClient(new WebviewConnector(), this);
  }

  select(node: HtmlNode) {
    console.log('select', node);
    this.node.next(node);
  }
}