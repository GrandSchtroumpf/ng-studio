import { Component, ChangeDetectionStrategy, Input, Pipe, PipeTransform } from '@angular/core';
import { FormOutlet } from 'ng-form-factory';
import { ElementForm, ElementSchema } from '../../element.form';
import { DirectiveContext } from 'ng-morph/typescript';

@Component({
  selector: 'ast-form-element',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormElementComponent implements FormOutlet {
  @Input() form: ElementForm;
  @Input() schema: ElementSchema;
  @Input() context: DirectiveContext;
}

@Pipe({ name: 'inputCtx' })
export class InputContextPipe implements PipeTransform {
  transform(context: DirectiveContext) {
    return context.properties;
  }
}

@Pipe({ name: 'outputCtx' })
export class OutputContextPipe implements PipeTransform {
  transform(context: DirectiveContext) {
    return context.methods;
  }
}