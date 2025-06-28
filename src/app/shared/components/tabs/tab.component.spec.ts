import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabComponent } from './tab.component';

describe('TabComponent', () => {
  let component: TabComponent;
  let fixture: ComponentFixture<TabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.disabled).toBe(false);
    expect(component.closable).toBe(false);
    expect(component.badge).toBeUndefined();
    expect(component.icon).toBeUndefined();
    expect(component.id).toBeUndefined();
  });

  it('should accept input properties', () => {
    component.label = 'Test Tab';
    component.disabled = true;
    component.closable = true;
    component.badge = '5';
    component.icon = 'star';
    component.id = 'test-tab';

    expect(component.label).toBe('Test Tab');
    expect(component.disabled).toBe(true);
    expect(component.closable).toBe(true);
    expect(component.badge).toBe('5');
    expect(component.icon).toBe('star');
    expect(component.id).toBe('test-tab');
  });

  it('should have content template reference', () => {
    expect(component.content).toBeDefined();
  });
});