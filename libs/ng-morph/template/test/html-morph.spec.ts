import { TemplateAst, getTemplateAst } from '../src/morph';
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

  test('get template ast', () => {
    const ast = getTemplateAst('<h1>Hello World</h1>');
    expect(ast instanceof TemplateAst).toBeTruthy();
  });

  test('push', () => {
    const ast = getTemplateAst('<h1></h1>');
    const parent = ast.getNode<ElementNode>('0');
    ast.push(textNode('Hello World'), '0');
    const childId = createId('0', 0);
    const child = ast.getNode<TextNode>(childId);
    expect(parent.children.length).toBe(1);
    expect(child.id).toEqual(childId);
    const { nodes } = ast.getAst();
    expect(nodes[0]).toBe(parent);
  });

  test('insert', () => {
    const ast = getTemplateAst('<ul><li>World</li></ul>');
    const parent = ast.getNode<ElementNode>('0');
    const child = elementNode({ name: 'li', children: [textNode('Hello')] });
    const childId = createId('0', 0);
    ast.insert(child, 0, '0');
    expect(parent.children.length).toBe(2);
    expect(child.id).toEqual(childId);
    const { nodes } = ast.getAst();
    expect(nodes[0]).toBe(parent);
  });

  test('pop', () => {
    const ast = getTemplateAst('<ul><span>Hello</span><li>World</li></ul>');
    const parent = ast.getNode<ElementNode>('0');
    const child = ast.pop<ElementNode>('0');
    expect(parent.children.length).toBe(1);
    expect(child.name).toBe('li');
    const { nodes } = ast.getAst();
    expect(nodes[0]).toBe(parent);
  });

  test('remove', () => {
    const ast = getTemplateAst('<ul><span>Hello</span><li>World</li></ul>');
    const parent = ast.getNode<ElementNode>('0');
    const child = ast.remove<ElementNode>(0, '0');
    expect(parent.children.length).toBe(1);
    expect(child.name).toBe('span');
    const { nodes } = ast.getAst();
    expect(nodes[0]).toBe(parent);
  });

  test('move', () => {
    const ast = getTemplateAst('<h1></h1><ul>Hello<li>World</li></ul>');
    ast.move('1-0', '0-1');
    const h1 = ast.getNode<ElementNode>('0');
    const ul = ast.getNode<ElementNode>('1');
    expect(h1.children.length).toBe(1);
    expect(ul.children.length).toBe(1);
    const { nodes } = ast.getAst();
    expect(nodes[0]).toBe(h1);
    expect(nodes[1]).toBe(ul);
  })
});