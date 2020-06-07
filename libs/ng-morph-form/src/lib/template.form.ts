import { FormGroupSchema, createForms, FormEntity, GetForm } from "ng-form-factory";
import { text, list } from "./schema";
import { TemplateNode, structuralDirective } from "ng-morph/template";
import { attributeSchema } from './attribute.form';

// SCHEMA
interface TemplateSchema extends FormGroupSchema<TemplateNode> {}
export const templateSchema: TemplateSchema = {
  form: 'group',
  load: 'entity',
  controls: {
    tagName: text(),
    templateAttrs: list(attributeSchema),
    variables: list(attributeSchema),
  },
}

// FORM

type TemplateFormKeys = {
  [key in keyof TemplateNode]: GetForm<TemplateSchema['controls'][key]>
}

export type TemplateForm = FormEntity<TemplateSchema, TemplateNode> & TemplateFormKeys;

export function templateForm(template: Partial<TemplateNode> = {}): TemplateForm {
  const initial = structuralDirective(template);
  const form = createForms(templateSchema, initial);
  for (const key in initial) {
    form[key] = form.get(key as keyof TemplateNode);
  }
  return form as any;
}
