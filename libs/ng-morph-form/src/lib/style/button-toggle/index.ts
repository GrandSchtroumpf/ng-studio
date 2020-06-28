import { Component, NgModule, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { FormOutlet } from 'ng-form-factory';
import { ButtonToggleSchema } from './schema';


@Component({
  selector: 'form-button-toggle',
  template: `
  <mat-button-toggle-group [formControl]="form" [multiple]="schema.multiple">
    <ng-container *ngFor="let option of schema.options | keyvalue : keepOrder">
      <mat-button-toggle [value]="option.key">{{ option.value }}</mat-button-toggle>
    </ng-container>
    <ng-container *ngFor="let icon of schema.icons | keyvalue : keepOrder">
      <mat-button-toggle [value]="icon.key">
        <mat-icon>{{ icon.value }}</mat-icon>
      </mat-button-toggle>
    </ng-container>
  </mat-button-toggle-group>`,
})
export class ButtonToggleFormComponent implements FormOutlet {
  @Input() form: FormControl;
  @Input() schema: ButtonToggleSchema;
  keepOrder = () => 1;
}

@NgModule({
  declarations: [ButtonToggleFormComponent],
  exports: [ButtonToggleFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonToggleModule,
    MatIconModule
  ]
})
export class ButtonToggleFormModule { }