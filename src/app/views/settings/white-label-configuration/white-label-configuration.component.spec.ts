import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhiteLabelConfigurationComponent } from './white-label-configuration.component';

describe('WhiteLabelConfigurationComponent', () => {
  let component: WhiteLabelConfigurationComponent;
  let fixture: ComponentFixture<WhiteLabelConfigurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WhiteLabelConfigurationComponent]
    });
    fixture = TestBed.createComponent(WhiteLabelConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
