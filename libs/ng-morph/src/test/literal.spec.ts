import { Project, SyntaxKind, SourceFile, ObjectLiteralExpression } from 'ts-morph';
import { getLiteralStructure, getObjectLiteralExpressionStructure } from '../lib/utils';

describe.skip('Literal Structure', () => {
  let index = 0;
  let project: Project;
  let file: SourceFile;

  function getSourceFile(code: string) {
    return project.createSourceFile(`${index++}`, code);
  }

  beforeAll(() => {
    project = new Project();
  })

  // Litterals
  describe('Value', () => {
    beforeAll(() => {
      file = getSourceFile(`const name = 'name'; const age = 42;`);
    })
    test('String', () => {
      const literal = file.getFirstDescendantByKind(SyntaxKind.StringLiteral);
      expect(getLiteralStructure(literal)).toEqual({ kind: SyntaxKind.StringLiteral, value: 'name' });
    });
    test('Number', () => {
      const literal = file.getFirstDescendantByKind(SyntaxKind.NumericLiteral);
      expect(getLiteralStructure(literal)).toEqual({ kind: SyntaxKind.NumericLiteral, value: 42 });
    });
  });

  describe('Object', () => {
    let literal: ObjectLiteralExpression;
    beforeAll(() => {
      file = getSourceFile(`const name = const obj = {
        propertyAssignment: 5,
        shorthandPropertyAssignment,
        ...spreadAssignment,
        get getAccessor() {
            return 5;
        },
        set setAccessor(value: number) {
            // do something
        },
        method() {
            return "some string"
        }
      };`);
      literal = file.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression);
    });
    test('Get all properties', () => {
      const structure = getObjectLiteralExpressionStructure(literal);
      expect(structure.kind).toBe(SyntaxKind.ObjectLiteralExpression);
      expect(structure.properties.length).toBe(6);
    })
    // test('Property Assignment', () => {
    //   literal.
    // })
  })

});