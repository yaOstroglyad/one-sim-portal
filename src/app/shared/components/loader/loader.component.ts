import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    imports: [CommonModule],
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {}
