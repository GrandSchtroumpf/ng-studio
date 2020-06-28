import { FormControlSchema } from 'ng-form-factory';

export interface ButtonToggleSchema extends FormControlSchema {
  options?: Record<string, string>;
  icons?: Record<string, string>;
  multiple: boolean
}

export const buttonToggleSchema = (params: Partial<ButtonToggleSchema> = {}): ButtonToggleSchema => {
  return {
    form: 'control',
    load: 'buttonToggle',
    options: {},
    icons: {},
    multiple: false,
    ...params
  }
}