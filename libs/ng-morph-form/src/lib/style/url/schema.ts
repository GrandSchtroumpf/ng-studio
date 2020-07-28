import { FormControlSchema } from 'ng-form-factory';

export interface UrlSchema extends FormControlSchema {
  formats: ('images' | 'javascript')[];
}

export function urlSchema(params: Partial<UrlSchema> = {}): UrlSchema {
  return {
    form: 'control',
    load: 'url',
    formats: ['images'],
    ...params,
  };
}