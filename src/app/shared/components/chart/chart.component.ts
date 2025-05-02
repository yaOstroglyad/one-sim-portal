import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import Chart from 'chart.js/auto';
import { LocalStorageService } from 'ngx-webstorage';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-chart',
  templateUrl: 'chart.component.html',
  styleUrls: ['chart.component.scss'],
  imports: [
    CommonModule,
    TranslateModule
  ],
  standalone: true,
})
export class ChartComponent implements AfterViewInit, OnChanges {
  @ViewChild('doughnutChartCanvas') private doughnutChartCanvas: ElementRef;

  chart: any;

  @Input() chartData: any;
  @Input() expiredAt: string;

  private primaryColor: string;

  constructor(private $LocalStorageService: LocalStorageService) {
    const viewConfig = this.$LocalStorageService.retrieve('viewConfig');
    this.primaryColor = viewConfig.primaryColor || '#f89c2e';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes.chartData) {
      this.renderChart();
    }
  }

  ngAfterViewInit() {
    this.renderChart();
  }

  renderChart() {
    const canvas = this.doughnutChartCanvas?.nativeElement;
    const context = canvas?.getContext('2d');
    context?.clearRect(0, 0, canvas.width, canvas.height);

    if(this.chart) {
      this.chart.destroy();
    }

    if(context) {
      this.chart = new Chart(context, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [this.chartData.remaining, this.chartData.used],
            backgroundColor: [this.primaryColor, '#cdcdcd'],
            borderWidth: 0,
            borderRadius: 40
          }]
        },
        options: {
          cutout: '90%',
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }
}
