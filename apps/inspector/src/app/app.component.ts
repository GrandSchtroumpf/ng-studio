import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { elementForm, elementSchema } from 'ng-morph-form';
import { InspectorClient } from './client';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'ng-studio-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  form = elementForm();
  schema = elementSchema;
  node$ = this.client.node$;


  constructor(
    private client: InspectorClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.client.node$.pipe(filter(v => !!v)).subscribe(node => {
      this.form = elementForm(node);
      this.cdr.markForCheck();
    });
  }

  save() {
    // this.client.call('template', 'updateNode', this.form.value);
  }
}
