import { elementForm, ElementForm, createElementNode } from "../lib/element.form";

describe('Element Form', () => {
  let form: ElementForm;
  beforeEach(() => {
    form = elementForm();
  })
  test('Form exist', () => {
    expect(form.value.inputs).toBeDefined();
  });

  test('Add Attribute', () => {
    form.attributes.add({ name: 'key' });
    expect(form.attributes.at(0).value.name).toBe('key');
  });

  test('Reset form with new value', () => {
    console.log(Object.keys(form));
    const el = createElementNode({ name: 'header'});
    form.reset(el);
    expect(form.value.name).toBe('header');
  })
});