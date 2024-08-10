import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared';
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
		password: new FormControl(null),
		rememberMe: new FormControl(true)
	});

	constructor(private loginService: LoginService,
							private authService: AuthService,
							private router: Router) { }

	ngOnInit(): void {
		this.authService.deleteLoginResponse();
	}

	login(): void {
		this.loginService.login(this.form.value);
		this.router.navigate(['/home']);
	}

	quickLoginByAdmin(): void {
		this.form.controls['loginName'].setValue('admin');
		this.form.controls['password'].setValue('admin');
		// this.form.controls['loginName'].setValue('anex@mail.com');
		// this.form.controls['password'].setValue('customer');
		this.form.controls['rememberMe'].setValue(true);
		this.loginService.login(this.form.value);
		this.router.navigate(['/home']);
	}
}
