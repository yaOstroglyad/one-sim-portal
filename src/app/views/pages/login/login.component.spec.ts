import { beforeEach, describe, expect, it, vi } from "vitest";
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { LoginComponent } from './login.component';
import { LoginService } from './login.service';
import { AuthService } from '@shared';
import { CacheHubService } from '@shared/services/cache-hub';

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoginComponent, TranslateModule.forRoot()],
            providers: [
                { provide: LoginService, useValue: { login: vi.fn() } },
                { provide: AuthService, useValue: { deleteLoginResponse: vi.fn() } },
                { provide: CacheHubService, useValue: { clear: vi.fn() } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
