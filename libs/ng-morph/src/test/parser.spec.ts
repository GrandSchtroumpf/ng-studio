import { Parser } from "@angular/compiler/src/expression_parser/parser";
import { Lexer } from "@angular/compiler/src/expression_parser/lexer";

const lexer = new Lexer();
const parser = new Parser(lexer);

describe('Parser', () => {
  test('parse binding', () => {
    const ast = parser.parseSimpleBinding('name | async', '', undefined);
    console.log(ast);
    expect(ast).toBeDefined();
  })
})