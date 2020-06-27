import {
  FormOutlet,
  FormFactoryModule,
  FormGroupSchema,
  FormEntity,
} from 'ng-form-factory';
import { ChangeDetectionStrategy, NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'form-group',
  template: `
    <ng-container *ngFor="let control of form.controls | keyvalue">
      <form-outlet [path]="control.key"></form-outlet>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormGroupComponent implements FormOutlet {
  form: FormEntity<any>;
  schema: FormGroupSchema<any>;
}

@NgModule({
  declarations: [FormGroupComponent],
  exports: [FormGroupComponent],
  imports: [CommonModule, ReactiveFormsModule, FormFactoryModule],
})
export class FormGroupModule {}
