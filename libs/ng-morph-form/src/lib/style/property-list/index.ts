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
  selector: 'form-property-list',
  template: `
    <ul>
      <ng-container *ngFor="let property of schema.controls | keyvalue : keepOrder">
        <li class="property" >
          <label>{{ property.key }}</label>
          <div>
            <form-outlet [path]="property.key"></form-outlet>
          </div>
        </li>
      </ng-container>
    </ul>
  `,
  styles: [`
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
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormPropertyListComponent implements FormOutlet {
  form: FormEntity<any>;
  schema: FormGroupSchema<any>;
  keepOrder = () => 1;
}

@NgModule({
  declarations: [FormPropertyListComponent],
  exports: [FormPropertyListComponent],
  imports: [CommonModule, ReactiveFormsModule, FormFactoryModule],
})
export class FormPropertyListModule {}
