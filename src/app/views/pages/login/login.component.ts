import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/auth/auth.service';
import { LoginService } from './login.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
	@HostListener('window:keyup', ['$event'])
	keyEvent(event: KeyboardEvent) {
		if (event.key === 'Alt') {
			this.quickLoginByAdmin();
		}
	};

	form: FormGroup = new FormGroup({
		loginName: new FormControl(null),
		password: new FormControl(null)
	});

	constructor(private loginService: LoginService,
				private authService: AuthService,
				private router: Router) { }

	ngOnInit(): void {
		this.authService.deleteAuthenticationToken();
	}

	login(): void {
		// this.loginService.login(this.form.value);
		this.router.navigate(['/home']);
	}

	quickLoginByAdmin(): void {
		// this.form.controls['loginName'].setValue('customer1@mail.com');
		// this.form.controls['password'].setValue('customer');
		// this.loginService.login(this.form.value);
		this.router.navigate(['/home']);
	}

}
