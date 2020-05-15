import { elementForm } from "../lib/element.form"

describe('Element Form', () => {
  test('Form exist', () => {
    const form = elementForm();
    console.log(form.value);
    form.add('children', []); // isControlSchema fails to find the schema
    expect(form.value.children).toBeDefined();
  })
})