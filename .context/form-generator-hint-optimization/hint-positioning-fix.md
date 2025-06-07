# Hint Positioning Fix

## 🎯 Проблема

После оптимизации возникли две проблемы с позиционированием:

### 1. Кастомные подсказки получали стили Material
Когда кастомные подсказки находятся внутри `mat-form-field`, Angular Material применяет к ним свои стили, что создает конфликты.

### 2. `mat-error` элементы не отображались
Material errors скрывались CSS правилами, предназначенными для оптимизации.

## ✅ Решение: Разделение на две зоны

### Структура шаблона:
```html
<div [attr.class]="getFormFieldClass(field)"> <!-- Spacing wrapper -->
  <mat-form-field class="w-100">              <!-- Field container -->
    <input matInput>
    <mat-error>Error message</mat-error>       <!-- Material errors INSIDE -->
  </mat-form-field>
  <!-- Custom hints OUTSIDE -->
  <ng-container *ngTemplateOutlet="hintTemplate">
</div>
```

### Применение к полям:

#### Email template:
```html
<ng-template #email let-field>
  <div [attr.class]="'w-100 ' + getFormFieldClass(field)">
    <mat-form-field appearance="outline" class="w-100">
      <input matInput type="email">
      
      <!-- Material errors inside -->
      <mat-error *ngIf="shouldShowError(field.name) && form.controls[field.name].hasError('required')">
        Email is required
      </mat-error>
      <mat-error *ngIf="shouldShowError(field.name) && form.controls[field.name].hasError('email')">
        Please, enter email format
      </mat-error>
    </mat-form-field>

    <!-- Custom hints outside -->
    <ng-container *ngTemplateOutlet="hintTemplate; context: { $implicit: field }"></ng-container>
  </div>
</ng-template>
```

#### Datepicker template:
```html
<ng-template #datePickerTemplate let-field>
  <div [attr.class]="getFormFieldClass(field)">
    <mat-form-field appearance="outline" class="full-width">
      <input matInput [matDatepicker]="picker">
      
      <!-- Material errors inside -->
      <mat-error *ngIf="shouldShowError(field.name) && form.controls[field.name].hasError('required')">
        The field is required
      </mat-error>
    </mat-form-field>

    <!-- Custom hints outside -->
    <ng-container *ngTemplateOutlet="hintTemplate; context: { $implicit: field }"></ng-container>
  </div>
</ng-template>
```

## 🎨 CSS исправления

### Показать Material errors:
```scss
:host ::ng-deep {
  // Показывать Material errors внутри subscript wrapper
  .mat-mdc-form-field-subscript-wrapper:has(.mat-error:not(:empty)) {
    display: block !important;
    margin-top: 0.5rem;
  }
  
  // Показывать Material errors напрямую
  mat-form-field.has-active-error .mat-mdc-form-field-subscript-wrapper {
    display: block !important;
  }
}
```

## 📋 Преимущества решения

### ✅ Чистое разделение ответственности:
- **Material errors** → обрабатываются Angular Material (внутри)
- **Custom hints** → обрабатываются нашей системой (снаружи)

### ✅ Отсутствие конфликтов стилей:
- Material стили не влияют на кастомные подсказки
- Кастомные стили не ломают Material errors

### ✅ Консистентное поведение:
- Все типы полей используют одинаковую структуру
- Единая система отступов работает для всех элементов

## 🔧 Шаги для применения

1. **Обернуть поля в wrapper div** с классом отступов
2. **Оставить Material errors внутри** `mat-form-field`
3. **Вынести кастомные подсказки наружу** через `ngTemplateOutlet`
4. **Обновить CSS** для показа Material errors

Это решение обеспечивает корректную работу как Material errors, так и кастомных подсказок без конфликтов. 