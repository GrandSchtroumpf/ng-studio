import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormOutlet } from 'ng-form-factory';
import { ElementForm, ElementSchema } from '../../element.form';

@Component({
  selector: 'ast-form-element',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormElementComponent implements FormOutlet {
  @Input() form: ElementForm;
  @Input() schema: ElementSchema;
}
