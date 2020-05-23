import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Inject } from '@angular/core';
import { AstService, CLIENT, Client } from './ast.service';
import { elementForm, elementSchema } from 'ng-morph-form';
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
  node$ = this.ast.node$;


  constructor(
    @Inject(CLIENT) private client: Client,
    private ast: AstService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.ast.node$.pipe(filter(v => !!v)).subscribe(node => {
      this.form = elementForm(node);
      this.cdr.markForCheck();
    });
  }

  save() {
    this.client.call('template', 'updateNode', this.form.value);
  }
}
