import { Component } from '@angular/core';
import { VscodeService } from './vscode.service';

@Component({
  selector: 'ng-studio-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  file$ = this.vscode.file$;
  constructor(private vscode: VscodeService) {}
}
