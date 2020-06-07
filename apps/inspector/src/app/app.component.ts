import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { elementForm, elementSchema } from 'ng-morph-form';
import { InspectorClient } from './client';
import { filter } from 'rxjs/operators';
import { HtmlNode } from 'ng-morph/template';

@Component({
  selector: 'ng-studio-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  form = elementForm();
  schema = elementSchema;
  node: HtmlNode;
  node$ = this.client.node$;
  context$ = this.client.context$;

  constructor(
    private client: InspectorClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.client.node$.pipe(filter(v => !!v)).subscribe(node => {
      this.node = node;
      this.form = elementForm(node);
      this.cdr.markForCheck();
    });
  }

  save() {
    const node = { id: this.node.id, ...this.form.value };
    this.client.call('template', 'updateNode', node);
  }
}
