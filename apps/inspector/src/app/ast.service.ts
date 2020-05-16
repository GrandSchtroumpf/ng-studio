import { Injectable } from '@angular/core';
import { createWebviewClient } from './connector';
import { BehaviorSubject } from 'rxjs';
import { toElementNode } from 'ng-morph-form';

@Injectable({ providedIn: 'root' })
export class AstService {
  private node = new BehaviorSubject(null);
  public node$ = this.node.asObservable();
  constructor() {
    const client = createWebviewClient();
    client.onload(() => {
      client.on('template', 'selected', (node) => this.node.next(toElementNode(node)));
    })
  }
}