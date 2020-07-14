import { TextNode } from 'ng-morph/template';
import { FormGroupSchema } from 'ng-form-factory';
import { text } from '../schema';

export const textNodeSchema: FormGroupSchema<TextNode> = {
  form: 'group',
  load: 'entity',
  controls: {
    id: { form: 'control', load: 'text' },
    value: text()
  }
}