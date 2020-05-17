import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { AstService } from './ast.service';
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


  constructor(private ast: AstService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.ast.node$.pipe(filter(v => !!v)).subscribe(node => {
      this.form = elementForm(node);
      this.cdr.markForCheck();
    });
  }

  save() {
    this.ast.update(this.form.value);
  }
}
