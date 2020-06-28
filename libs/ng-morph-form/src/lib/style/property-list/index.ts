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

@Component({
  selector: 'form-property-list',
  template: `
    <ul>
      <ng-container *ngFor="let property of schema.controls | keyvalue: keepOrder">
        <li class="property">
          <div>
            <button mat-icon-button (click)="clear(property.key)">
              <mat-icon>not_interested</mat-icon>
            </button>
            <label>{{ property.key }}</label>
          </div>
          <div>
            <form-outlet [form]="form.get(property.key)" [schema]="property.value"></form-outlet>
          </div>
        </li>
      </ng-container>
    </ul>
  `,
  styles: [
    `
      ul {
        display: block;
        width: 100%;
        list-style: none;
        padding: 0;
      }
      .property {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    `,
  ]
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
  ],
})
export class FormPropertyListModule {}
