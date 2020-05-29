import * as factory from '../factory';
import * as view from '../view';

describe('View node', () => {
  test('create text', () => {
    const node = factory.createText('Hello World');
    const textNode = view.fromText(node, '');
    expect(textNode).toEqual({ id: 'text', value: 'Hello World' })
  });
})