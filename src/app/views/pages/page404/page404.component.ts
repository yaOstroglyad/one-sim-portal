import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    selector: 'app-page404',
    imports: [TranslateModule],
    templateUrl: './page404.component.html',
    styleUrls: ['./page404.component.scss']
})
export class Page404Component {

  constructor() { }

}
