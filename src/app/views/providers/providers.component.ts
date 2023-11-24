import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-providers',
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.scss']
})
export class ProvidersComponent implements OnInit {
  providersData: Array<any> = [];
  ngOnInit(): void {
    this.providersData = [{
      id: 1,
      name: 'Ventra'
    }]
  }

}
