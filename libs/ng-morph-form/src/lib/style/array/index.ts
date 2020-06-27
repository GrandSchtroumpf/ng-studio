import {
  FormArraySchema,
  FormList,
  FormOutlet,
  FormFactoryModule,
} from 'ng-form-factory';
import { ChangeDetectionStrategy, NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

export function arraySchema(
  params: Partial<FormArraySchema> = {}
): FormArraySchema {
  return {
    form: 'array',
    load: 'array',
    factory: { form: 'control', load: 'text' },
    controls: [],
    ...params,
  };
}

@Component({
  selector: 'form-list',
  template: `
    <ul>
      <li *ngFor="let control of form.controls; let i = index">
        <form-outlet [path]="i"></form-outlet>
        <button (click)="form.removeAt(i)">remove</button>
      </li>
      <li>
        <button (click)="form.add()">Add</button>
      </li>
    </ul>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormListComponent implements FormOutlet {
  form: FormList<any>;
  schema: FormArraySchema<any>;
}

@NgModule({
  declarations: [FormListComponent],
  exports: [FormListComponent],
  imports: [CommonModule, ReactiveFormsModule, FormFactoryModule],
})
export class FormListModule {}
