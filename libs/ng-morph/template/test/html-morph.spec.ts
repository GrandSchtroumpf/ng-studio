import { TemplateHost, getTemplateHost } from '../src/morph';
import { ElementNode, isElementNode, elementNode, TextNode, isTextNode, textNode, createId } from '../src/node';

describe('Create id', () => {
  test('create Id', () => {
    expect(createId(1)).toBe('1');
    expect(createId('0-1', 0)).toBe('0-1-0');
    expect(createId('0-1', '0')).toBe('0-1-0');
    expect(createId('0-1', '0-1')).toBe('0-1-0-1');
  })
});

describe('Create Node', () => {
  test('create test', () => {
    const child = textNode('Hello world');
    expect(child).toEqual({ id: '', value: 'Hello world' });
    expect(isTextNode(child)).toBeTruthy();
  })
  test('create element', () => {
    const child = elementNode({ name: 'li', children: [textNode('Hello')] });
    expect(child.children.length).toBe(1);
    expect(isElementNode(child)).toBeTruthy();
  })
})

describe('View node', () => {

  test('get template host', () => {
    const host = getTemplateHost('<h1>Hello World</h1>');
    expect(host instanceof TemplateHost).toBeTruthy();
  });

  test('push', () => {
    const host = getTemplateHost('<h1></h1>');
    const parent = host.getNode<ElementNode>('0');
    host.push(textNode('Hello World'), '0');
    const childId = createId('0', 0);
    const child = host.getNode<TextNode>(childId);
    expect(parent.children.length).toBe(1);
    expect(child.id).toEqual(childId);
    const { nodes } = host.getAst();
    expect(nodes[0]).toBe(parent);
  });

  test('insert', () => {
    const host = getTemplateHost('<ul><li>World</li></ul>');
    const parent = host.getNode<ElementNode>('0');
    const child = elementNode({ name: 'li', children: [textNode('Hello')] });
    const childId = createId('0', 0);
    host.insert(child, 0, '0');
    expect(parent.children.length).toBe(2);
    expect(child.id).toEqual(childId);
    const { nodes } = host.getAst();
    expect(nodes[0]).toBe(parent);
  });

  test('pop', () => {
    const host = getTemplateHost('<ul><span>Hello</span><li>World</li></ul>');
    const parent = host.getNode<ElementNode>('0');
    const child = host.pop<ElementNode>('0');
    expect(parent.children.length).toBe(1);
    expect(child.name).toBe('li');
    const { nodes } = host.getAst();
    expect(nodes[0]).toBe(parent);
  });

  test('remove', () => {
    const host = getTemplateHost('<ul><span>Hello</span><li>World</li></ul>');
    const parent = host.getNode<ElementNode>('0');
    const child = host.removeAt<ElementNode>(0, '0');
    expect(parent.children.length).toBe(1);
    expect(child.name).toBe('span');
    const { nodes } = host.getAst();
    expect(nodes[0]).toBe(parent);
  });

  test('move', () => {
    const host = getTemplateHost('<h1></h1><ul>Hello<li>World</li></ul>');
    host.move('1-0', '0-1');
    const h1 = host.getNode<ElementNode>('0');
    const ul = host.getNode<ElementNode>('1');
    expect(h1.children.length).toBe(1);
    expect(ul.children.length).toBe(1);
    const { nodes } = host.getAst();
    expect(nodes[0]).toBe(h1);
    expect(nodes[1]).toBe(ul);
  });

  test('update', () => {
    const host = getTemplateHost('<h1>Hello</h1>');
    host.update({ value: 'Hello World' }, '0-0');
    const node = host.getNode<TextNode>('0-0');
    expect(node).toEqual({ id: '0-0', value: 'Hello World' })
  })
});