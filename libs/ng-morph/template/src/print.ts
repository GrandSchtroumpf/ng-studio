import { HtmlNode, isElementNode, ElementNode, isTextNode, TextNode, ContentNode, isContentNode, AttributeNode, TemplateNode, NgTemplateNode, isNgTemplateNode } from './node';

const selfClosing = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
export function isSelfClosing(name: string) {
  return selfClosing.includes(name);
}

export function printNode(node: HtmlNode): string {
  if (isNgTemplateNode(node)) {
    return printNgTemplate(node);
  }
  if (isElementNode(node)) {
    return printElement(node);
  }
  if (isContentNode(node)) {
    return printContent(node);
  }
  if (isTextNode(node)) {
    return printText(node);
  }
  return '';
}

/////////////
// CONTENT //
/////////////
export function printContent(node: ContentNode) {
  const attributes = node.attributes.map(attr => printAttribute(attr)).join(' ');
  const name = 'ng-content';
  const tag = [name, attributes].filter(v => !!v).join(' ');
  return `<${tag}></${name}>`
}

//////////
// TEXT //
//////////
export function printText(node: TextNode) {
  return node.value;
}

/////////////
// ELEMENT //
/////////////

export function printElement(node: ElementNode) {
  // Important: Mutable function that should be before input/output
  const twoWayBinding = printTwoWayBinding(node);
  const name = node.name;
  const template = node.template ? printStructuralTemplate(node.template) : '';
  const refs = node.references.map(ref => printReference(ref)).join(' ');
  const attr = node.attributes.map(attribute => printAttribute(attribute)).join(' ');
  const inputs = node.inputs.map(input => printInput(input)).join(' ');
  const outputs = node.outputs.map(output => printOutput(output)).join(' ');
  const children = node.children.map(child => printNode(child)).join('');
  const tag = [name, template, refs, twoWayBinding, attr, inputs, outputs].filter(v => !!v).join(' ');
  return isSelfClosing(name)
    ? `<${tag} />`
    : `<${tag}>${children}</${name}>`;
}

export function printAttribute(node: AttributeNode) {
  return node.value ? `${node.name}="${node.value}"` : node.name;
}

/** Find two way bindings & remove them from input/output */
export function printTwoWayBinding(node: ElementNode) {
  const binding = [];
  node.inputs.forEach((input, i) => {
    node.outputs.forEach((output, j) => {
      if (output.name === `${input.name}Change`) {
        const outputHandler = output.value;
        const inputValue = input.value;
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

export function printInput(node: AttributeNode) {
  return `[${node.name}]="${node.value}"`;
}

export function printOutput(node: AttributeNode) {
  return `(${node.name})="${node.value}"`;
}

export function printReference(node: AttributeNode) {
  return node.value ? `#${node.name}="${node.value}"` : `#${node.name}`;
}


/////////////////
// NG-TEMPLATE //
/////////////////
export function printNgTemplate(node: NgTemplateNode) {
  const name = node.name;
  const variables = node.variables.map(variable => printVariable(variable)).join(' ');
  const refs = node.references.map(ref => printReference(ref)).join(' ');
  const attr = node.attributes.map(attribute => printAttribute(attribute)).join(' ');
  const inputs = node.inputs.map(input => printInput(input)).join(' ');
  const outputs = node.outputs.map(output => printOutput(output)).join(' ');
  const children = node.children.map(child => printNode(child)).join('');
  const tag = [name, variables, refs, attr, inputs, outputs].filter(v => !!v).join(' ');
  return `<${tag}>${children}</${name}>`
}

export function printVariable(node: AttributeNode) {
  return node.value
    ? `let-${node.name}="${node.value}"`
    : `let-${node.name}`;
}


/////////////////////////
// STRUCTURAL TEMPLATE //
/////////////////////////

export function printStructuralTemplate(node: TemplateNode) {
  if (!node.templateAttrs?.length) {
    return '';
  }
  // Transform a template Attributes into
  return getMicroSynthax(node);
}


export function printStructuralVariable(node: AttributeNode) {
  return (node.value === '$implicit')
    ? `let ${node.name}`
    : `let ${node.name} = ${node.value}`;
}

export function getSuffix(name: string, prefix: string) {
  return name.replace(prefix, '').replace(/^\w/, c => c.toLowerCase());
}

/** Transform a Template node into a TextAttribute */
export function getMicroSynthax(node: TemplateNode): AttributeNode {
  const prefix = node.templateAttrs[0].name;

  // Get the list of attribut expressions
  const attrExpression = node.templateAttrs.map(attr => {
    const suffix = getSuffix(attr.name, prefix);
    const value = attr.value;
    
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
  };
}