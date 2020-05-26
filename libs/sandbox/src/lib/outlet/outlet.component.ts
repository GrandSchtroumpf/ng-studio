import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'sandbox-outlet',
  templateUrl: './outlet.component.html',
  styleUrls: ['./outlet.component.scss']
})
export class OutletComponent implements OnInit {

  @Input() node
  @Input() selector: string;

  constructor() { }

  childSelector(child, i) {
    return `${this.selector} ${child.name}:nth-child(${i})`;
  }

  ngOnInit(): void {
  }

}
