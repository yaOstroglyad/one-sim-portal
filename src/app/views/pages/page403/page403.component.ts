import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page403',
  templateUrl: './page403.component.html',
  standalone: true,
  styleUrls: ['./page403.component.scss']
})
export class Page403Component {
  private router = inject(Router);

  goHome() {
    this.router.navigate(['/']);
  }
}
