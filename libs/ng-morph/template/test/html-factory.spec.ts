import { Element, Text, Template, Variable, Content, Reference } from '@angular/compiler/src/render3/r3_ast';
import * as factory from '../factory';
import * as printer from '../print';

describe('HTML Factory', () => {

  // TEXT

  test('Create Text', () => {
    const node = factory.createText('Hello World');
    const code = printer.printText(node);
    expect(node instanceof Text).toBeTruthy();
    expect(node.value).toBe('Hello World');
    expect(code).toBe('Hello World')
  });

  // ELEMENT

  test('Create Element', () => {
    const node = factory.createElement({ name: 'h1' });
    const code = printer.printElement(node);
    expect(node instanceof Element).toBeTruthy();
    expect(node.name).toBe('h1');
    expect(code).toBe('<h1></h1>')
  });

  test('Element with children', () => {
    const text = factory.createText('Hello World');
    const node = factory.createElement({ name: 'h1', children: [text] });
    const code = printer.printElement(node);
    expect(code).toBe('<h1>Hello World</h1>')
  });

  test('Create Reference', () => {
    const node = factory.createReference('ref');
    const code = printer.printReference(node);
    expect(node instanceof Reference).toBeTruthy();
    expect(node.name).toBe('ref');
    expect(code).toBe('#ref')
  });


  // TEMPLATE
  test('Create Template', () => {
    const node = factory.createTemplate();
    const code = printer.printTemplate(node);
    expect(node instanceof Template).toBeTruthy();
    expect(node.tagName).toBe('ng-template');
    expect(code).toBe('<ng-template></ng-template>')
  });

  test('Create variable', () => {
    const node = factory.createVariable('name');
    const code = printer.printVariable(node);
    expect(node instanceof Variable).toBeTruthy();
    expect(node.name).toBe('name');
    expect(node.value).toBe('');
    expect(code).toBe('let-name')
  });

  test('Create template with variables', () => {
    const variables = [
      factory.createVariable('name'),
      factory.createVariable('key', 'value')
    ];
    const node = factory.createTemplate({ variables });
    const code = printer.printTemplate(node);
    expect(code).toBe('<ng-template let-name let-key="value"></ng-template>');
  });

  test('Create Structural Template with child', () => {
    const node = factory.createTemplate({
      tagName: 'h1',
      children: [factory.createElement({ name: 'h1' })]
    });
    const code = printer.printTemplate(node);
    expect(code).toBe('<h1></h1>');
  });

  test('Create structural Template without child', () => {
    const node = factory.createTemplate({ tagName: 'h1' });
    const code = printer.printTemplate(node);
    expect(code).toBe('<h1></h1>');
  })


  // CONTENT
  test('Create ng-content', () => {
    const node = factory.createContent();
    const code = printer.printContent(node);
    expect(node instanceof Content).toBeTruthy();
    expect(node.selector).toBe('*');
    expect(code).toBe('<ng-content></ng-content>')
  });

})