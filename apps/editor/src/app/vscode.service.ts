import { Injectable } from '@angular/core';
import { createWebviewClient } from './connector';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class VscodeService {
  file$ = new BehaviorSubject(null);
  // TODO: do not reconnect after reconnect
  constructor() {
    const client = createWebviewClient();
    client.onload(() => {
      client.on('project', 'change', (structure) => {
        this.file$.next(structure);
      });
      client.on('project', 'save', (structure) => {
        this.file$.next(structure);
      })
      // Select HTML
      client.on('project', 'select', (node) => {
        console.log('Get Message')
        this.file$.next(node);
      })
    })
  }
}
