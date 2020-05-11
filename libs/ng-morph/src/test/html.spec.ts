import { parseTemplate } from '@angular/compiler';

describe('HTML', () => {
  test('template', (done) => {
    print()
    const node = parseTemplate('<h1>Hello World</h1>', 'template.html');
    node.nodes.map(n => n)
    console.log(node);
    expect(node).toBeDefined();
    done();
  })
})
