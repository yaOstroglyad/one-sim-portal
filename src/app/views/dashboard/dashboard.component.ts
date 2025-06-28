import { Component, OnInit } from '@angular/core';
import { TabChangeEvent } from '../../shared/components/tabs/tabs.types';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  basicTabIndex = 0;

  constructor() { }

  ngOnInit(): void {
  }

  onCardClick(cardType: string): void {
    console.log(`${cardType} card clicked!`);
  }

  onTabChange(event: TabChangeEvent): void {
    console.log('Tab changed:', event);
    this.basicTabIndex = event.index;
  }

}