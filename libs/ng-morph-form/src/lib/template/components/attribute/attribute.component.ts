import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormList, FormArraySchema } from 'ng-form-factory';
import { AttributeNode } from 'ng-morph/template';

@Component({
  selector: 'ast-form-attribute',
  templateUrl: './attribute.component.html',
  styleUrls: ['./attribute.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormAttributeComponent implements OnInit {

  @Input() form: FormList<FormArraySchema<AttributeNode>>;
  @Input() options: string[];

  constructor() { }

  ngOnInit(): void {
  }

}
