import { Element, Node, Template, Text, TextAttribute, BoundAttribute, BoundEvent, Reference, BoundText, Variable, Content } from '@angular/compiler/src/render3/r3_ast';
import { parseTemplate, ASTWithSource, AST } from '@angular/compiler';
import { isElement, isTemplate, isText, isBoundText, isContent } from './helpers';

const selfClosing = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
export function isSelfClosing(name: string) {
  return selfClosing.includes(name);
}

type TemplateAst = ReturnType<typeof parseTemplate>;

export function printTemplateAst(ast: { nodes: Node[] }) {
  return ast.nodes.map(node => printNode(node)).join(' ');
}

export function printNode(node: Node): string {
  if (isElement(node)) {
    return printElement(node);
  }
  if (isTemplate(node)) {
    return printTemplate(node);
  }
  if (isContent(node)) {
    return printContent(node);
  }
  if (isText(node)) {
    return printText(node);
  }
  if (isBoundText(node)) {
    return printBoundText(node);
  }
  return '';
}

export function printAst(node: AST) {
  if (node instanceof ASTWithSource) {
    return printAstWithSource(node);
  }
}

/// AST
export function printAstWithSource(node: ASTWithSource) {
  return node.source;
}

//////////
// TEXT //
//////////

export function printText(node: Text) {
  return node.value;
}

export function printBoundText(node: BoundText) {
  return printAst(node.value);
}


/////////////
// ELEMENT //
/////////////

export function printElement(node: Element) {
  // Important: Mutable function that should be before input/output
  const twoWayBinding = printTwoWayBinding(node);
  const name = node.name;
  const refs = node.references.map(ref => printReference(ref)).join(' ');
  const attr = node.attributes.map(attribute => printAttribute(attribute)).join(' ');
  const inputs = node.inputs.map(input => printInput(input)).join(' ');
  const outputs = node.outputs.map(output => printOutput(output)).join(' ');
  const children = node.children.map(child => printNode(child)).join('');
  const tag = [name, refs, twoWayBinding, attr, inputs, outputs].filter(v => !!v).join(' ');
  return isSelfClosing(name)
    ? `<${tag} />`
    : `<${tag}>${children}</${name}>`;
}

export function printAttribute(node: TextAttribute) {
  return node.value ? `${node.name}="${node.value}"` : node.name;
}

/** Find two way bindings & remove them from input/output */
export function printTwoWayBinding(node: Element) {
  const binding = [];
  node.inputs.forEach((input, i) => {
    node.outputs.forEach((output, j) => {
      if (output.name === `${input.name}Change`) {
        const outputHandler = printAst(output.handler);
        const inputValue = printAst(input.value);
        if (outputHandler === `${inputValue}=$event`) {
          binding.push(`[(${input.name})]="${inputValue}"`);
          node.inputs.splice(i, 1);
          node.outputs.splice(j, 1);
        }
      }
    })
  });
  return binding.join(' ');
}

export function printInput(node: BoundAttribute) {
  const value = printAst(node.value);
  return `[${node.name}]="${value}"`;
}

export function printOutput(node: BoundEvent) {
  const handler = printAst(node.handler);
  return `(${node.name})="${handler}"`;
}

export function printReference(node: Reference) {
  return node.value ? `#${node.name}="${node.value}"` : `#${node.name}`;
}


//////////////
// TEMPLATE //
//////////////

export function printTemplate(node: Template) {
  return node.tagName === 'ng-template'
    ? printNgTemplate(node)
    : printStructuralDirective(node);
}


export function printNgTemplate(node: Template) {
  const tagName = node.tagName;
  const variables = node.variables.map(variable => printVariable(variable)).join(' ');
  const children = node.children.map(child => printNode(child)).join('');
  const tag = [tagName, variables].filter(v => !!v).join(' ');
  return `<${tag}>${children}</${tagName}>`
}


export function printVariable(node: Variable) {
  return node.value
    ? `let-${node.name}="${node.value}"`
    : `let-${node.name}`;
}

export function printStructuralDirective(node: Template) {
  const child = node.children.find(el => isElement(el) && el.name === node.tagName) as Element;
  if (!node.templateAttrs?.length) {
    return printNode(child);
  } else {
    // Transform a template Attributes into
    const attribut = getMicroSynthax(node);
    child.attributes.unshift(attribut);
    return printNode(child);
  }
}

export function printStructuralVariable(node: Variable) {
  return (node.value === '$implicit')
    ? `let ${node.name}`
    : `let ${node.name} = ${node.value}`;
}

export function getSuffix(name: string, prefix: string) {
  return name.replace(prefix, '').replace(/^\w/, c => c.toLowerCase());
}

/** Transform a Template node into a TextAttribute */
export function getMicroSynthax(node: Template) {
  const prefix = node.templateAttrs[0].name;

  // Get the list of attribut expressions
  const attrExpression = node.templateAttrs.map(attr => {
    const suffix = getSuffix(attr.name, prefix);
    const value = (typeof attr.value === 'string') ? attr.value : printAst(attr.value);
    
    // If there is a value
    if (value) {
  
      // If there is a variable targeting this attribute use "as"
      const attrVarIndex = node.variables.findIndex(v => v.value === attr.name);
      if (attrVarIndex !== -1) {
        const [variable] = node.variables.splice(attrVarIndex, 1);  // remove variable from list
        return suffix ? `${suffix} ${value} as ${variable.name}` : `${value} as ${variable.name}`;
      } else {
        return suffix ? `${suffix} ${value}` : `${value}`;
      }

    } else {

      // If not value check if there is an implicit variable
      const implicitVarIndex = node.variables.findIndex(v => v.value === '$implicit');
      if (implicitVarIndex !== -1) {
        const [variable] = node.variables.splice(implicitVarIndex, 1);  // remove variable from list
        return `let ${variable.name}`
      } else {
        return '';
      }

    }
  }).filter(v => !!v).join(' ');

  // Get the list of variable (the "as" case is in the attr expression)
  const varExpression = node.variables.map(variable => {
    if (variable.value === '$implicit') {
      return `let ${variable.name}`;
    } else {
      return `let ${variable.name} = ${variable.value}`
    }
  }).filter(v => !!v).join('; ');

  const expression = [attrExpression, varExpression].filter(v => !!v).join('; ');
  return {
    name: `*${prefix}`,
    value: expression
  } as TextAttribute;
}

/////////////
// CONTENT //
/////////////

export function printContent(node: Content) {
  const attributes = node.attributes.map(attr => printAttribute(attr)).join(' ');
  const name = 'ng-content';
  const tag = [name, attributes].filter(v => !!v).join(' ');
  return `<${tag}></${name}>`
}