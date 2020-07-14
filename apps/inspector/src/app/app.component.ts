import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { ElementForm, ElementSchema, elementForm, fromElementBuilder } from 'ng-morph-form';
import { InspectorClient } from './client';
import { filter } from 'rxjs/operators';
import { TagNode } from 'ng-morph/template';

@Component({
  selector: 'ng-studio-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  form: ElementForm;
  schema: ElementSchema;
  node: TagNode;
  node$ = this.client.node$;
  context$ = this.client.context$;

  constructor(
    private client: InspectorClient,
    private cdr: ChangeDetectorRef
  ) {
    const [ schema, form ] = elementForm();
    this.schema = schema;
    this.form = form;
  }

  ngOnInit() {
    this.client.node$.pipe(filter(v => !!v)).subscribe(node => {
      this.node = node as TagNode;
      const [ schema, form ] = elementForm(node);
      this.schema = schema;
      this.form = form;
      this.cdr.markForCheck();
    });
  }

  save() {
    const node = { id: this.node.id, ...fromElementBuilder(this.form.value) };
    // Check node if it has the text
    this.client.call('template', 'updateNode', node);
  }
}
