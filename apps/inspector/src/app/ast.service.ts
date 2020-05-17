import { Injectable } from '@angular/core';
import { createWebviewClient } from './connector';
import { BehaviorSubject } from 'rxjs';
import { toElementNode, ElementNode } from 'ng-morph-form';

@Injectable({ providedIn: 'root' })
export class AstService {
  private client = createWebviewClient();
  private node = new BehaviorSubject(null);
  public node$ = this.node.asObservable();
  constructor() {
    this.client.onload(() => {
      this.client.on('template', 'selected', (node) => this.node.next(toElementNode(node)));
    })
  }

  update(node: ElementNode) {
    this.client.call('template', 'updateNode', node);
  }
}