import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ChipsInputComponent } from './chips-input.component';

describe('ChipsInputComponent', () => {
  let component: ChipsInputComponent;
  let fixture: ComponentFixture<ChipsInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipsInputComponent, TranslateModule.forRoot(), NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ChipsInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
