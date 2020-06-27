import { Injectable } from '@angular/core';
import { PluginClient } from '@remixproject/plugin';
import { createWebviewClient } from '@remixproject/plugin-vscode'
import { Rule } from 'ng-morph/style';
import { BehaviorSubject } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class Client extends PluginClient<any, any> {

  private rule = new BehaviorSubject<Rule>(null);
  public rule$ = this.rule.asObservable();

  private selectors = new BehaviorSubject<string[]>(null);
  public selectors$ = this.selectors.asObservable();

  constructor() {
    super();
    createWebviewClient(this)
    this.onload(() => {
      this.on('stylesheet', 'selectSelectors', (selectors: string[]) => this.selectors.next(selectors));
      this.on('stylesheet', 'selectRule', (rule: Rule) => this.rule.next(rule));
    })
  }

}