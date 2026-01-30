import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { IconSetService } from '@coreui/icons-angular';
import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
import { AuthService } from '@shared';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                provideRouter([]),
                IconSetService,
                { provide: LocalStorageService, useValue: { retrieve: () => null } },
                { provide: SessionStorageService, useValue: { retrieve: () => null } },
                { provide: AuthService, useValue: { scheduleTokenRefresh: () => { } } }
            ]
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });
});
