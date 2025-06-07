# Troubleshooting Guide

## 🚨 Критические проблемы и решения

### 1. Пустые контейнеры показывают `display: block`

**Симптомы:**
- Контейнер `mat-form-field-subscript-wrapper` виден в DOM с `display: block`
- Нет видимого контента, но занимает место
- Ненужные отступы под полями формы

**Причины:**
```html
<!-- Angular Material создает пустые элементы -->
<div class="mat-mdc-form-field-subscript-wrapper">
  <div class="mat-mdc-form-field-hint-wrapper"></div> <!-- Пустой но существует -->
</div>
```

**✅ Решение:**
```typescript
// Строгая проверка активного состояния
const hasActiveHint = !!(field.hintMessage && field.hintMessage.trim());
const hasActiveError = !!(
  control && 
  control.errors && 
  Object.keys(control.errors).length > 0 &&
  (control.touched || control.dirty) // БЕЗ control.invalid!
);
```

### 2. Ошибки отображаются для нетронутых required полей

**Проблема:**
```typescript
// ❌ НЕПРАВИЛЬНО - обязательные поля всегда invalid
if (control.invalid) {
  // Это true даже для нетронутых полей
}
```

**✅ Решение:**
```typescript
shouldShowError(fieldName: string): boolean {
  const control = this.form?.get(fieldName);
  return !!(control && control.errors && (control.touched || control.dirty));
}
```

### 3. Динамические обновления не работают с OnPush

**Проблема:** Ошибки появляются/исчезают, но DOM не обновляется

**✅ Решение:**
```typescript
private initHintStateTracking(): void {
  const statusChanges$ = this.config.fields.map(field => {
    const control = this.form.get(field.name);
    return control?.statusChanges.pipe(
      startWith(control.status),
      distinctUntilChanged()
    );
  });
  
  merge(...statusChanges$).pipe(
    takeUntil(this.unsubscribe$)
  ).subscribe(() => {
    this.cdr.markForCheck(); // Принудительное обновление
  });
}
```

### 4. Подсказки получают стили Material внутри mat-form-field

**Проблема:** Кастомные подсказки конфликтуют со стилями Angular Material

**✅ Решение:** Вынести подсказки наружу:
```html
<div [attr.class]="getFormFieldClass(field)">
  <mat-form-field>
    <input matInput>
    <mat-error>Material errors INSIDE</mat-error>
  </mat-form-field>
  <!-- Custom hints OUTSIDE -->
  <ng-container *ngTemplateOutlet="hintTemplate"></ng-container>
</div>
```

## 🔍 Debug инструменты

### Проверка состояния поля:
```typescript
debugFieldState(fieldName: string) {
  const control = this.form?.get(fieldName);
  const field = this.config.fields.find(f => f.name === fieldName);
  
  console.log('Field Debug:', {
    fieldName,
    hasErrors: !!(control?.errors),
    isTouched: control?.touched,
    isDirty: control?.dirty,
    hintMessage: field?.hintMessage,
    hintTrimmed: field?.hintMessage?.trim(),
    shouldShow: this.hasFieldHintOrError(field)
  });
}
```

### CSS debug (временно):
```scss
.mat-mdc-form-field-subscript-wrapper {
  border: 1px solid red; // Визуальный индикатор
}

.mat-mdc-form-field-subscript-wrapper:empty::after {
  content: "EMPTY"; // Debug текст
  color: red;
}
```

## ✅ Быстрые проверки

1. **Поле без контента** → нет subscript контейнера в DOM
2. **Пробелы в hintMessage** → должны игнорироваться 
3. **Нетронутое required поле** → без ошибок и контейнеров
4. **Тронутое невалидное поле** → контейнер с ошибкой появляется
5. **Поле с подсказкой** → контейнер всегда виден

## 🎯 Профилактика

- Всегда используйте `field.hintMessage?.trim()` для проверки подсказок
- Не полагайтесь на `control.invalid` для проверки ошибок
- Используйте `touched || dirty` для показа ошибок
- Выносите кастомные подсказки за пределы `mat-form-field`
- Тестируйте с `ChangeDetectionStrategy.OnPush` 