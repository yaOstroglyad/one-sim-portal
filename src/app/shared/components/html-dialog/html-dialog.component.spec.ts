import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HtmlDialogComponent } from './html-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { By } from '@angular/platform-browser';

describe('HtmlDialogComponent', () => {
  let component: HtmlDialogComponent;
  let fixture: ComponentFixture<HtmlDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HtmlDialogComponent,
        TranslateModule.forRoot(),
        MatButtonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HtmlDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit htmlInserted event when insertHtml is called', () => {
    // Arrange
    spyOn(component.htmlInserted, 'emit');
    const testHtml = '<p>Test HTML</p>';
    component.htmlInput.nativeElement.value = testHtml;

    // Act
    component.insertHtml();

    // Assert
    expect(component.htmlInserted.emit).toHaveBeenCalledWith(testHtml);
  });

  it('should emit dialogCanceled event when cancelHtmlInsert is called', () => {
    // Arrange
    spyOn(component.dialogCanceled, 'emit');

    // Act
    component.cancelHtmlInsert();

    // Assert
    expect(component.dialogCanceled.emit).toHaveBeenCalled();
  });

  it('should open dialog when open method is called', () => {
    // Arrange
    spyOn(component.htmlDialog.nativeElement, 'showModal');
    
    // Act
    component.open();
    
    // Assert
    expect(component.htmlDialog.nativeElement.showModal).toHaveBeenCalled();
    expect(component.htmlInput.nativeElement.value).toBe('');
  });

  it('should close dialog when close method is called', () => {
    // Arrange
    spyOn(component.htmlDialog.nativeElement, 'close');
    
    // Act
    component.close();
    
    // Assert
    expect(component.htmlDialog.nativeElement.close).toHaveBeenCalled();
  });
}); 