import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabsComponent } from './tabs.component';
import { TabComponent } from './tab.component';
import { Component } from '@angular/core';

@Component({
  template: `
    <os-tabs [(activeTabIndex)]="activeTab" (tabChange)="onTabChange($event)">
      <os-tab label="Tab 1">Content 1</os-tab>
      <os-tab label="Tab 2" [disabled]="true">Content 2</os-tab>
      <os-tab label="Tab 3" [closable]="true">Content 3</os-tab>
    </os-tabs>
  `
})
class TestHostComponent {
  activeTab = 0;
  
  onTabChange(event: any) {
    this.activeTab = event.index;
  }
}

describe('TabsComponent', () => {
  let component: TabsComponent;
  let fixture: ComponentFixture<TabsComponent>;
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabsComponent, TabComponent],
      declarations: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TabsComponent);
    component = fixture.componentInstance;
    
    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should generate correct tab classes', () => {
    component.variant = 'pills';
    component.size = 'large';
    component.position = 'left';
    component.customClass = 'my-custom-class';

    const classes = component.tabsClasses;
    
    expect(classes).toContain('os-tabs');
    expect(classes).toContain('os-tabs--pills');
    expect(classes).toContain('os-tabs--large');
    expect(classes).toContain('os-tabs--left');
    expect(classes).toContain('my-custom-class');
  });

  it('should select tab correctly', () => {
    spyOn(component.tabChange, 'emit');
    component.selectTab(1);
    
    expect(component.activeTabIndex).toBe(1);
    expect(component.tabChange.emit).toHaveBeenCalled();
  });

  it('should not select disabled tab', () => {
    const initialTab = component.activeTabIndex;
    component.tabs = [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2', disabled: true }
    ];
    
    component.selectTab(1);
    
    expect(component.activeTabIndex).toBe(initialTab);
  });

  it('should emit close event for closable tab', () => {
    spyOn(component.tabClose, 'emit');
    const mockEvent = new Event('click');
    spyOn(mockEvent, 'stopPropagation');
    
    component.tabs = [
      { id: 'tab1', label: 'Tab 1', closable: true }
    ];
    
    component.closeTab(0, mockEvent);
    
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.tabClose.emit).toHaveBeenCalled();
  });

  it('should handle keyboard navigation', () => {
    component.tabs = [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' },
      { id: 'tab3', label: 'Tab 3' }
    ];
    
    const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    spyOn(mockEvent, 'preventDefault');
    spyOn(component, 'selectTab');
    
    component.navigateTab(1, mockEvent);
    
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(component.selectTab).toHaveBeenCalledWith(1);
  });

  it('should validate active tab index', () => {
    component.tabs = [
      { id: 'tab1', label: 'Tab 1' },
      { id: 'tab2', label: 'Tab 2' }
    ];
    component.activeTabIndex = 5; // Invalid index
    
    component['validateActiveTab']();
    
    expect(component.activeTabIndex).toBe(1); // Should be set to last valid index
  });
});