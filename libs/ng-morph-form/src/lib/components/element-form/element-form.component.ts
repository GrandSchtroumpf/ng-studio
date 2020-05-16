import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormOutlet } from 'ng-form-factory';
import { ElementForm, ElementSchema } from '../../element.form';

@Component({
  selector: 'ast-form-element',
  templateUrl: './element-form.component.html',
  styleUrls: ['./element-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormElementComponent implements FormOutlet {
  @Input() form: ElementForm;
  @Input() schema: ElementSchema;
}
