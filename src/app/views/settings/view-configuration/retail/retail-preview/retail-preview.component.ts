import { Component, Input, ElementRef, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-retail-preview',
  templateUrl: './retail-preview.component.html',
  styleUrls: ['./retail-preview.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class RetailPreviewComponent implements OnChanges, OnInit {
  @Input() primary: string = '#f9a743';
  @Input() primaryHover: string = '#eab308';
  @Input() borderNeutral: string = '0, 0%, 50%';
  @Input() backdrop: string = '#272727cc';
  @Input() brandName: string = 'OnlySim';
  @Input() heroTitle: string = "Connect Globally with <span class='text-primary'>OnlySim eSIM</span>";
  @Input() heroSubTitle: string = "Stay connected worldwide with our reliable and affordable eSIM solutions.";
  @Input() logoWidth: number = 120;
  @Input() logoHeight: number = 40;
  @Input() logoUrl: string = 'assets/img/brand/1esim-logo.png';
  @Input() faviconUrl: string = 'assets/img/brand/1esim-logo-small.png';
  @Input() supportUrl: string = 'https://t.me/only_sim_bot';

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    // Устанавливаем CSS-переменную при инициализации
    this.updatePrimaryColorVariable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Если изменился primary цвет, обновляем CSS-переменную
    if (changes['primary']) {
      this.updatePrimaryColorVariable();
    }
  }

  private updatePrimaryColorVariable(): void {
    this.el.nativeElement.style.setProperty('--retail-primary-color', this.primary);
  }
}
