import { FormGroupSchema, createForms, FormEntity, GetForm } from "ng-form-factory";
import { selectSchema } from './select';
import { propertyListSchema } from './property-list/schema';
import { ruleSchema } from './rule/schema';
import { unitSchema } from './unit/schema';
import { buttonToggleSchema } from './button-toggle/schema';
import { textAlignIcons, alignItemsIcons } from './statics';
import { colorSchema } from './color/schema';
import { urlSchema } from './url';
// MODEL
type RuleSection = Partial<Record<keyof CSSStyleDeclaration, string>>;

interface RuleBuilder {
  layout: RuleSection;
  position: RuleSection;
  size: RuleSection;
  text: RuleSection;
  background: RuleSection;
  flex: RuleSection;
}

function getKeys(d: Partial<CSSStyleDeclaration>, keys: (keyof CSSStyleDeclaration)[]): RuleSection {
  const value = {};
  for (const key of keys) {
    value[key] = d[key];
  }
  return value;
}

export function toRuleBuilder(d: Partial<CSSStyleDeclaration>): RuleBuilder {
  return {
    layout: getKeys(d, ['display']),
    position: getKeys(d, ['position', 'top', 'left', 'right', 'bottom']),
    size: getKeys(d, ['width', 'height', 'margin', 'padding']),
    text: getKeys(d, ['fontSize', 'textAlign', 'color']),
    background: getKeys(d, ['backgroundColor']),
    flex: getKeys(d, ['alignItems'])
  }
}

export function fromRuleBuilder(builder: RuleBuilder): Partial<CSSStyleDeclaration> {
  const declarations = {};
  for (const section in builder) {
    const properties = builder[section];
    for (const property in properties) {
      declarations[property] = properties[property];
    }
  }
  return declarations;
}

function createRuleBuilder(params: Partial<RuleBuilder> = {}): RuleBuilder {
  return {
    layout: {},
    position: {},
    size: {},
    text: {},
    background: {},
    flex: {},
    ...params
  };
}

// SCHEMA
export interface RuleSchema extends FormGroupSchema<RuleBuilder> {}
export const styleSchema: RuleSchema = ruleSchema<RuleBuilder>({
  layout: propertyListSchema({
    display: selectSchema({ options: ['flex', 'block', 'inline-block', 'inline'] }),
  }),
  position: propertyListSchema({
    position: selectSchema({ options: ['relative', 'absolute', 'fixed'] }),
    top: unitSchema(),
    left: unitSchema(),
    bottom: unitSchema(),
    right: unitSchema(),
  }),
  size: propertyListSchema({
    width: unitSchema(['px', '%', 'vw']),
    height: unitSchema(['px', '%', 'vh']),
    margin: unitSchema(['px', '%']),
    padding: unitSchema(['px', '%']),
  }),
  text: propertyListSchema({
    fontSize: unitSchema(['px', 'em', 'rem']),
    textAlign: buttonToggleSchema({ icons: textAlignIcons }),
    color: colorSchema()
  }),
  background: propertyListSchema({
    backgroundColor: colorSchema(),
    backgroundPosition: unitSchema(['px', '%']),
    backgroundImage: urlSchema()
  }),
  flex: propertyListSchema({
    alignItems: buttonToggleSchema({ icons: alignItemsIcons })
  })
});

// FORM

type RuleFormKeys = {
  [key in keyof RuleBuilder]: GetForm<RuleSchema['controls'][key]>
}

export type RuleForm = FormEntity<RuleSchema, RuleBuilder> & RuleFormKeys;

export function ruleForm(rule: Partial<RuleBuilder> = {}): RuleForm {
  const initial = createRuleBuilder(rule);
  const form = createForms(styleSchema, initial);
  for (const key in initial) {
    form[key] = form.get(key as keyof RuleBuilder);
  }
  return form as any;
}
