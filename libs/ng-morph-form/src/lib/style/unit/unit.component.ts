import { Component, OnDestroy, ChangeDetectionStrategy, Input, NgModule } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormOutlet } from 'ng-form-factory';
import { Subscription } from 'rxjs';
import { UnitSchema } from './schema';

interface Unit {
  value: number;
  unit: string;
}

@Component({
  selector: 'form-unit-container',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormUnitComponent implements FormOutlet, OnDestroy {
  private sub: Subscription[];
  @Input() schema: UnitSchema;
  @Input()
  set form(form: any) {
    if (form) {
      this.unsubscribe();
      this.sub = [
        // Write value from parent form to local
        form.value$.subscribe(v => {
          if (!!v) {
            const regex = new RegExp(/^(?<value>[0-9\.]*?)(?<unit>[a-z%]*)$/g);
            const { value = '', unit = this.schema.options[0] } = regex.exec(v).groups;
            this.accessorForm.setValue({ value, unit });
          } else {
            this.accessorForm.reset();
          }
        }),
  
        // Read value from local form to parent
        this.accessorForm.valueChanges.subscribe(({ value, unit }: Unit) => {
          if (value && unit) {
            form.setValue(value + unit, { emitEvent: false });  // Do not trigger value$ above
          }
        })
      ];
    }
  }

  accessorForm = new FormGroup({
    value: new FormControl(),
    unit: new FormControl()
  });


  private unsubscribe() {
    if (this.sub) {
      this.sub.forEach(sub => sub.unsubscribe());
    }
  }
  
  ngOnDestroy() {
    this.unsubscribe();
  }
}

@NgModule({
  declarations: [FormUnitComponent],
  exports: [FormUnitComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ]
})
export class FormUnitModule { }
