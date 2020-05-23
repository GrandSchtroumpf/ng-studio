import { Injectable, InjectionToken, Inject } from '@angular/core';
import { createWebviewClient } from './connector';
import { BehaviorSubject } from 'rxjs';
import { toElementNode, ElementNode } from 'ng-morph-form';
import { Client as RemixPluginClient } from '@remixproject/plugin';


export type Client = RemixPluginClient<any, any>;
export const CLIENT = new InjectionToken<Client>('VSCode plugin client', {
  providedIn: 'root',
  factory: () => createWebviewClient()
});

@Injectable({ providedIn: 'root' })
export class AstService {
  private node = new BehaviorSubject(null);
  public node$ = this.node.asObservable();
  constructor(@Inject(CLIENT) private client: Client) {
    this.client.onload(() => {
      this.client.on('template', 'selected', (node) => this.node.next(toElementNode(node)));
    })
  }

  update(node: ElementNode) {
    this.client.call('template', 'updateNode', node);
  }
}