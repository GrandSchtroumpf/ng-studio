import { Plugin } from '@remixproject/engine';
import { CompileTemplateMetadata } from '@angular/compiler';
import { promises as fs, watch } from 'fs';
import { DirectiveNode } from 'ng-morph/typescript';
import { parseStyle, StylesheetHost } from 'ng-morph/style';

export class StylesheetPlugin extends Plugin {
  metadata: CompileTemplateMetadata;
  directiveNode: DirectiveNode;
  stylesheet: StyleSheet;
  host: StylesheetHost;

  constructor() {
    super({ name: 'stylesheet', methods: [] });
  }

  onActivation() {
    this.on('project', 'selectDirective', (node: DirectiveNode) => {
      this.directiveNode = node;
      this.init(node.templateMetadata);
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
      }
      watch(metadata.templateUrl, 'utf-8', () => update());
      update();
    }
  }

  selectRule(selector: string) {
    const rule = this.host.getRule(selector);
    this.emit('selected', rule);
  }

  private async save() {
    const code = this.host.print();
    const path = this.metadata.templateUrl;
    await fs.writeFile(path, code);
  }
}
