import { ChangeDetectionStrategy, Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from '../../../shared';
import { LoginService } from './login.service';
import { CacheHubService } from '../../../shared/services/cache-hub';

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

	constructor(
		private loginService: LoginService,
		private authService: AuthService,
		private cacheHubService: CacheHubService
	) { }

	ngOnInit(): void {
		this.authService.deleteLoginResponse();
		// Clear all cached data when arriving at login page
		this.cacheHubService.clear();
	}

	login(): void {
		this.loginService.login(this.form.value);
	}

	quickLoginByAdmin(): void {
		this.form.controls['loginName'].setValue('daniel@1-esim.com');
		this.form.controls['password'].setValue('admin');
		// this.form.controls['loginName'].setValue('anex@mail.com');
		// this.form.controls['password'].setValue('customer');
		this.form.controls['rememberMe'].setValue(true);
		this.loginService.login(this.form.value);
	}
}
