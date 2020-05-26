import { Injectable, InjectionToken, Inject } from '@angular/core';
import { createWebviewClient } from './connector';
import { BehaviorSubject } from 'rxjs';
import { Client as RemixPluginClient } from '@remixproject/plugin';

export type Client = RemixPluginClient<any, any>;
export const CLIENT = new InjectionToken<Client>('VSCode plugin client', {
  providedIn: 'root',
  factory: () => createWebviewClient()
});

@Injectable({ providedIn: 'root' })
export class AstService {
  private path = new BehaviorSubject<string>(null);
  public path$ = this.path.asObservable();
  constructor(@Inject(CLIENT) private client: Client) {
    // this.client.onload(() => {
    //   this.client.on('vscode', 'focus', (path: string) => {
    //     if (path.includes('component.ts')) {
    //       this.path.next(path.replace('.ts', ''));
    //     }
    //   });
    // })
  }

}