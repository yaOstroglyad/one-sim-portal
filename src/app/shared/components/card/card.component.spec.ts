import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate correct card classes', () => {
    component.variant = 'elevated';
    component.size = 'large';
    component.interactive = true;
    component.selected = true;
    component.customClass = 'my-custom-class';

    const classes = component.cardClasses;
    
    expect(classes).toContain('os-card');
    expect(classes).toContain('os-card--elevated');
    expect(classes).toContain('os-card--large');
    expect(classes).toContain('os-card--interactive');
    expect(classes).toContain('os-card--selected');
    expect(classes).toContain('my-custom-class');
  });

  it('should show header when title is provided', () => {
    component.title = 'Test Title';
    expect(component.shouldShowHeader).toBe(true);
  });

  it('should show header when subtitle is provided', () => {
    component.subtitle = 'Test Subtitle';
    expect(component.shouldShowHeader).toBe(true);
  });

  it('should hide header when showHeader is false', () => {
    component.title = 'Test Title';
    component.showHeader = false;
    expect(component.shouldShowHeader).toBe(false);
  });

  it('should apply disabled state correctly', () => {
    component.disabled = true;
    const classes = component.cardClasses;
    expect(classes).toContain('os-card--disabled');
  });
});