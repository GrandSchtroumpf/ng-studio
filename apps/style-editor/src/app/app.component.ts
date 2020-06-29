import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Client } from './client';
import { BehaviorSubject } from 'rxjs';
import { ruleForm, styleSchema, toRuleBuilder, fromRuleBuilder } from 'ng-morph-form';
import { Rule } from 'ng-morph/style';

@Component({
  selector: 'style-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  form = ruleForm();
  schema = styleSchema;
  rule: Rule;

  selected$ = new BehaviorSubject(undefined);
  selectors$ = this.client.selectors$;
  sections = ['layout'];

  constructor(private client: Client, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.client.rule$.subscribe(rule => {
      this.rule = rule;
      if (rule) {
        const builder = toRuleBuilder(rule.declarations);
        this.form = ruleForm(builder);
        this.cdr.markForCheck();
      }
    });
  }

  public select(id: string) {
    this.client.call('stylesheet', 'selectRule', id);
  }

  save() {
    const style = this.form.value;
    this.rule.declarations = fromRuleBuilder(style);
    this.client.call('stylesheet', 'update', this.rule);
  }
}
