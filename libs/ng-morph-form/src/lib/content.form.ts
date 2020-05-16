import { FormGroupSchema, FormEntity, GetForm, createForms } from 'ng-form-factory';
import { text, list } from './schema';
import { AttributeNode, attributeSchema } from './attribute.form';

// MODEL
export interface ContentNode {
  selector: string;
  attributes?: AttributeNode[];
}

// FACTORY
export const createContentNode = (params: Partial<ContentNode> = {}): ContentNode => ({
  selector: '*',
  ...params
});

// SCHEMA
interface ContentSchema extends FormGroupSchema<ContentNode> {}
export const contentSchema: ContentSchema = {
  form: 'group',
  load: 'entity',
  controls: {
    selector: text(),
    attributes: list(attributeSchema)
  }
};


// FORM

type ContentFormKeys = {
  [key in keyof ContentNode]: GetForm<ContentSchema['controls'][key]>
}

export type ContentForm = FormEntity<ContentSchema, ContentNode> & ContentFormKeys;

export function contentForm(content: Partial<ContentNode> = {}): ContentForm {
  const initial = createContentNode(content);
  const form = createForms(contentSchema, initial);
  for (const key in initial) {
    form[key] = form.get(key as keyof ContentNode);
  }
  return form as any;
}
