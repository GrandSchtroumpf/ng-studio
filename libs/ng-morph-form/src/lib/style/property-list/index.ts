import {
  FormOutlet,
  FormFactoryModule,
  FormGroupSchema,
  FormEntity,
} from 'ng-form-factory';
import { ChangeDetectionStrategy, NgModule, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'form-property-list',
  template: `
    <mat-list>
      <ng-container *ngFor="let property of schema.controls | keyvalue: keepOrder">
        <mat-list-item class="property">
          <button matListIcon mat-icon-button (click)="clear(property.key)">
            <mat-icon>not_interested</mat-icon>
          </button>
          <label matLine>{{ property.key }}</label>
          <form-outlet [form]="form.get(property.key)" [schema]="property.value"></form-outlet>
        </mat-list-item>
      </ng-container>
    </mat-list>
  `,
})
export class FormPropertyListComponent implements FormOutlet {
  @Input() form: FormEntity<any>;
  @Input() schema: FormGroupSchema<any>;
  keepOrder = () => 1;

  clear(key: string) {
    this.form.get(key).reset(null);
  }
}

@NgModule({
  declarations: [FormPropertyListComponent],
  exports: [FormPropertyListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFactoryModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
  ],
})
export class FormPropertyListModule {}
