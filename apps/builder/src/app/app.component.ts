import { Component } from '@angular/core';
import { AstService } from './ast.service';
import { switchMap, filter, tap, startWith } from 'rxjs/operators';

@Component({
  selector: 'ng-studio-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private service: AstService) {}
}
