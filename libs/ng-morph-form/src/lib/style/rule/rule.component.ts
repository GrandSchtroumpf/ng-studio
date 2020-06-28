import { Component, Input, ChangeDetectionStrategy, NgModule } from '@angular/core';
import { FormOutlet, FormFactoryModule } from 'ng-form-factory';
import { RuleForm, RuleSchema } from '../style.form';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: '[form] [schema] ast-form-rule',
  templateUrl: './rule.component.html',
  styleUrls: ['./rule.component.scss'],
})
export class FormRuleComponent implements FormOutlet {
  @Input() form: RuleForm;
  @Input() schema: RuleSchema;
  keepOrder: () => 1;
}


@NgModule({
  declarations: [FormRuleComponent],
  exports: [FormRuleComponent],
  imports: [
    CommonModule,
    FormFactoryModule,
    ReactiveFormsModule,
    MatExpansionModule,
  ]
})
export class FormRuleModule { }
