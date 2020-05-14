import { parseTemplate } from '@angular/compiler';
import * as printer from '../print';

describe('Parse HTML', () => {
  function testPrint(title: string, { original, result }) {
    test(title, (done) => {
      const node = parseTemplate(original, 'template.html');
      const code = printer.printTemplateAst(node);
      expect(code).toBe(result);
      done();
    });
  }

  describe('Element', () => {
    testPrint('text', {
      original: '<h1>Hello World</h1>',
      result: '<h1>Hello World</h1>'
    });

    testPrint('children', {
      original: '<header> <h1>Hello World</h1> </header>',
      result: '<header><h1>Hello World</h1></header>'
    });

    testPrint('self-closing & ref with value', {
      original: '<img #ref="myRef"/>',
      result: '<img #ref="myRef" />'
    });

    testPrint('refs > attr > inputs > outputs', {
      original: '<h1 (click)="method()" opened [key]="property" #ref name="myName"></h1>',
      result: '<h1 #ref opened name="myName" [key]="property" (click)="method()"></h1>'
    });

    testPrint('Two way binding', {
      original: '<input (dateChange)="setDate($event)" [date]="date"  placeholder="Date picker" [(ngModel)]="text"  >',
      result: '<input [(ngModel)]="text" placeholder="Date picker" [date]="date" (dateChange)="setDate($event)" />'
    });

  });

  describe('Text', () => {
    testPrint('Bound text', {
      original: '<h1>{{user$ | async}}</h1>',
      result: '<h1>{{user$ | async}}</h1>'
    });
    testPrint('Bound text inside with text', {
      original: '<h1>Start: {{event.start | date}}, end: {{event.end | date}}</h1>',
      result: '<h1>Start: {{event.start | date}}, end: {{event.end | date}}</h1>'
    });
  })

  describe('Template', () => {
    testPrint('No template attributes with variables', {
      original: '<ng-template let-implicit let-variable="value"></ng-template>',
      result: '<ng-template let-implicit let-variable="value"></ng-template>'
    });

    testPrint('structural directive', {
      original: `<page *url="'user/:id' let userId=id"></page>`,
      result: `<page *url="'user/:id'; let userId = id"></page>`,
    });

    testPrint('ngIf', {
      original: '<h1 *ngIf="exist$ | async as exist">Hello World</h1>',
      result: '<h1 *ngIf="exist$ | async as exist">Hello World</h1>',
    });

    testPrint('ngFor', {
      original: '<h1 *ngFor="let user of users$ | async; let i=index let odd=odd ">Hello</h1>',
      result: '<h1 *ngFor="let user of users$ | async; let i = index; let odd = odd">Hello</h1>',
    });

    testPrint('ngSwitch', {
      original: `<div [ngSwitch]="name"><div *ngSwitchCase="'grandschtroumpf'">Hello</div><div *ngSwitchDefault>Default</div></div>`,
      result: `<div [ngSwitch]="name"><div *ngSwitchCase="'grandschtroumpf'">Hello</div><div *ngSwitchDefault>Default</div></div>`
    });
  });

  describe('Content', () => {
    testPrint('Content without select', {
      original: '<ng-content></ng-content>',
      result: '<ng-content></ng-content>'
    });

    testPrint('Content with select', {
      original: '<ng-content select="[slot][two]"></ng-content>',
      result: '<ng-content select="[slot][two]"></ng-content>'
    });

  })
});
