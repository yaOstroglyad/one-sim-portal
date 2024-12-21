import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-loader',
	templateUrl: './loader.component.html',
	standalone: true,
  imports: [CommonModule],
  styleUrls: ['./loader.component.scss'],
})
export class LoaderComponent {}
