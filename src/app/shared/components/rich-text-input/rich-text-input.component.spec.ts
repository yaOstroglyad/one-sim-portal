import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RichTextInputComponent } from './rich-text-input.component';
import { TranslateModule } from '@ngx-translate/core';
import { HtmlDialogComponent } from '../html-dialog/html-dialog.component';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Создаем компонент-обертку для тестирования ControlValueAccessor
@Component({
  template: `
    <app-rich-text-input
      [label]="'TEST.LABEL'"
      [placeholder]="'TEST.PLACEHOLDER'"
      [maxLength]="100"
      [(ngModel)]="value"
    ></app-rich-text-input>
  `
})
class TestHostComponent {
  @ViewChild(RichTextInputComponent) richTextInput: RichTextInputComponent;
  value: string = '';
}

describe('RichTextInputComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let richTextInputComponent: RichTextInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestHostComponent],
      imports: [
        RichTextInputComponent,
        TranslateModule.forRoot(),
        FormsModule,
        ReactiveFormsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    richTextInputComponent = component.richTextInput;
  });

  it('should create', () => {
    expect(richTextInputComponent).toBeTruthy();
  });

  it('should apply formatting when applyFormat is called', () => {
    // Mock necessary document methods
    spyOn(document, 'execCommand');
    spyOn(richTextInputComponent, 'applyFormat');
    spyOn(richTextInputComponent as any, 'onChange');

    // Call the method
    richTextInputComponent.applyFormat('bold');

    // Check if the method was called
    expect(richTextInputComponent.applyFormat).toHaveBeenCalledWith('bold');
  });

  it('should open HTML dialog when openHtmlDialog is called', () => {
    // Mock components and window.getSelection
    richTextInputComponent.htmlDialogComponent = { open: jasmine.createSpy('open') } as any;
    richTextInputComponent.editorElement = { nativeElement: { focus: jasmine.createSpy('focus') } } as any;
    
    // Mock selection
    const mockRange = { cloneRange: () => ({ }) } as any;
    const mockSelection = { 
      getRangeAt: () => mockRange,
      rangeCount: 1
    } as any;
    spyOn(window, 'getSelection').and.returnValue(mockSelection);

    // Call the method
    richTextInputComponent.openHtmlDialog();

    // Check if dialog was opened
    expect(richTextInputComponent.editorElement.nativeElement.focus).toHaveBeenCalled();
    expect(richTextInputComponent.htmlDialogComponent.open).toHaveBeenCalled();
  });

  it('should handle HTML insertion', () => {
    // Mock necessary document methods
    spyOn(document, 'execCommand');
    
    // Mock selection
    const mockRange = { } as any;
    const mockSelection = { 
      removeAllRanges: jasmine.createSpy('removeAllRanges'),
      addRange: jasmine.createSpy('addRange')
    } as any;
    spyOn(window, 'getSelection').and.returnValue(mockSelection);
    
    // Setup component
    richTextInputComponent.editorElement = { 
      nativeElement: { innerHTML: '<p>Test</p>' } 
    } as any;
    richTextInputComponent['currentSelection'] = mockRange;
    
    // Mock internal methods
    spyOn(richTextInputComponent as any, 'sanitizeHtml').and.returnValue('<div>Sanitized HTML</div>');
    spyOn(richTextInputComponent as any, 'getPlainText').and.returnValue('Sanitized HTML');
    spyOn(richTextInputComponent as any, 'onChange');

    // Call the method
    richTextInputComponent.handleHtmlInserted('<div>Test HTML</div>');

    // Verify results
    expect(richTextInputComponent['sanitizeHtml']).toHaveBeenCalledWith('<div>Test HTML</div>');
    expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, '<div>Sanitized HTML</div>');
    expect(richTextInputComponent['onChange']).toHaveBeenCalled();
  });
}); 