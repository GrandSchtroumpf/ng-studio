import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { GetForm, FormList, FormArraySchema } from 'ng-form-factory';
import { AttributeNode } from '../../attribute.form';

@Component({
  selector: 'ast-form-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormAttributeComponent implements OnInit {

  @Input() form: FormList<FormArraySchema<AttributeNode>>;

  constructor() { }

  ngOnInit(): void {
  }

}
