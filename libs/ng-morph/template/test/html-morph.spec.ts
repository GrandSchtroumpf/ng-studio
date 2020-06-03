import { TemplateHost, getTemplateHost, Element } from '../src/morph';
import { ElementNode, isElementNode, elementNode, TextNode, isTextNode, textNode, createId, contentNode, isContentNode } from '../src/node';

describe('Create id', () => {
  test('create Id', () => {
    expect(createId(1)).toBe('1');
    expect(createId('0-1', 0)).toBe('0-1-0');
    expect(createId('0-1', '0')).toBe('0-1-0');
    expect(createId('0-1', '0-1')).toBe('0-1-0-1');
  });
});

describe('Create Node', () => {
  test('create text', () => {
    const child = textNode('Hello world');
    expect(child).toEqual({ id: '', value: 'Hello world' });
    expect(isTextNode(child)).toBeTruthy();
  });
  test('create content', () => {
    const child = contentNode();
    expect(child).toEqual({ id: '', selector: '*', attributes: [] });
    expect(isContentNode(child)).toBeTruthy();
  });
  test('create element', () => {
    const child = elementNode({ name: 'li', children: [textNode('Hello')] });
    expect(child.children.length).toBe(1);
    expect(isElementNode(child)).toBeTruthy();
  });
})

describe('Host', () => {

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

describe('Element', () => { 
  test('Create', () => {
    const element = new Element();
    expect(element).toBeDefined();
  });

  test('Add attributes', () => {
    const element = Element.fromName('h1');
    element.addTextAttribute('id', 'my-id');
    element.addInput('class', 'myClass');
    element.addOuput('click', 'onClick()');
    element.addReference('ref');
    const node = element.getNode();
    expect(node).toEqual({
      id: '0',
      name: 'h1',
      attributes: [{ name: 'id', value: 'my-id'}],
      inputs: [{ name: 'class', value: 'myClass'}],
      outputs: [{ name: 'click', value: 'onClick()'}],
      references: [{ name: 'ref', value: '' }],
      children: [],
    });
  });

  test('Remove attributes', () => {
    const node = {
      name: 'h1',
      attributes: [{ name: 'id', value: 'my-id'}],
      inputs: [{ name: 'class', value: 'myClass'}],
      outputs: [{ name: 'click', value: 'onClick()'}],
      references: [{ name: 'ref', value: '' }],
    };
    const element = new Element(node);
    element.removeTextAttribute('id');
    element.removeInput('class');
    element.removeOutput('click');
    element.removeReference('ref');
    expect(node).toEqual({ id: '0', name: 'h1', attributes: [], inputs: [], outputs: [], references: [], children: [] });
  });

  test('Push', () => {
    const element = Element.fromName('ul');
    const node = element.getNode();
    element.push(elementNode({ name: 'li' }));
    expect(node.children.length).toBe(1);
    element.insert(textNode('Hello'), 0);
    expect(node.children.length).toBe(2);
    expect(node.children[0]).toEqual({ id: '0-0', value: 'Hello' });
  });
});
