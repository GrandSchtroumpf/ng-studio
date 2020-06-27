import { Plugin } from '@remixproject/engine';
import { CompileTemplateMetadata } from '@angular/compiler';
import { promises as fs, watch } from 'fs';
import { DirectiveNode } from 'ng-morph/typescript';
import { parseStyle, StylesheetHost, getSelectorTag, Rule } from 'ng-morph/style';
import { TagNode } from 'ng-morph/template';

export class StylesheetPlugin extends Plugin {
  metadata: CompileTemplateMetadata;
  directiveNode: DirectiveNode;
  stylesheet: StyleSheet;
  host: StylesheetHost;

  constructor() {
    super({ name: 'stylesheet', methods: ['selectRule', 'update'] });
  }

  onActivation() {
    this.on('project', 'selectDirective', (node: DirectiveNode) => {
      this.directiveNode = node;
      this.init(node.templateMetadata);
    });
    this.on('template', 'selectNode', (node: TagNode) => {
      const selectorTag = getSelectorTag(node);
      const selectors = this.host.getSelectors(selectorTag);
      this.emit('selectSelectors', selectors);
      if (selectors.length === 1) {
        this.selectRule(selectors[0]);
      } else {
        this.emit('selectRule', undefined);
      }
    });
  }

  init(metadata: CompileTemplateMetadata) {
    this.metadata = metadata;
    const [url] = metadata.styleUrls;
    // Work only with one stylesheet
    if (url) {
      const update = async () => {
        const code = await fs.readFile(url, 'utf-8');
        this.host = parseStyle(code); 
        const ast = this.host.getAst();
        this.emit('selectAst', ast);
        this.emit('selectRule', undefined);
      }
      watch(url, 'utf-8', () => update());
      update();
    }
  }

  selectRule(selector: string) {
    const rule = this.host.getRule(selector);
    this.emit('selectRule', rule);
  }

  update(rule: Rule) {
    this.host.update(rule);
    this.save();
  }

  async save() {
    const code = this.host.print();
    const [url] = this.metadata.styleUrls;
    await fs.writeFile(url, code);
  }
}
