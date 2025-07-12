# SCSS Architecture Guidelines

## 📋 File Structure Rules

### Core Foundation (порядок импорта)
```scss
src/scss/
├── _variables.scss         // 🔧 Только переменные и maps
├── _mixins.scss           // 🎨 Все mixins (generate-colors, component patterns)
├── _utilities.scss        // 🛠️ Все utility классы (spacing, shadows, etc.)
├── _components.scss       // 🧩 Shared component patterns
├── _vendor-overrides.scss // 📦 AG-Grid, Material, CoreUI overrides
├── _layout.scss          // 📐 Layout and grid systems
├── _fixes.scss           // 🔧 Temporary fixes (should be minimal)
└── styles.scss           // 📄 Main entry point
```

## 🎯 Responsibility Rules

### ❌ ЗАПРЕЩЕНО

1. **Дублирование утилит**
   ```scss
   // ❌ НЕ создавать новые spacing утилиты
   .my-component-spacing { margin: 16px; }
   
   // ✅ Использовать существующие
   .my-component { @include spacing('margin', 4); }
   ```

2. **Hardcoded значения**
   ```scss
   // ❌ НЕ использовать магические числа
   box-shadow: 0 4px 8px rgba(0,0,0,0.1);
   
   // ✅ Использовать системные значения
   box-shadow: map-get($shadows, 'md');
   ```

3. **Компонент-специфичные файлы в src/scss/**
   ```scss
   // ❌ НЕ создавать _my-component-utilities.scss
   // ✅ Все компонент-специфичные стили - в component.scss
   ```

### ✅ РАЗРЕШЕНО

1. **_variables.scss** - только переменные
   - Color maps, spacing scales, font sizes
   - CSS custom properties
   - БЕЗ mixins и утилит

2. **_mixins.scss** - все функции и mixins
   - Color generators
   - Component patterns
   - Responsive helpers

3. **_utilities.scss** - все utility классы
   - .m-*, .p-*, .text-*, .bg-*
   - Atomic CSS classes
   - БЕЗ component-specific логики

## 📐 Naming Conventions

### Component Classes
```scss
// ✅ BEM методология
.os-component-name { }
.os-component-name__element { }
.os-component-name--modifier { }
```

### Utility Classes
```scss
// ✅ Tailwind-inspired naming
.m-{size}     // margin
.p-{size}     // padding
.text-{size}  // font-size
.bg-{color}   // background
.border-{color} // border
```

### Sizes Standard
```scss
// ✅ Единый стандарт размеров
xs, sm, md, lg, xl, 2xl, 3xl
// 0, 1, 2, 3, 4, 5, 6 (для spacing)
```

## 🔄 Adding New Styles - Decision Tree

```
Новый стиль нужен?
├── Это CSS переменная? → _variables.scss
├── Это mixin/function? → _mixins.scss  
├── Это utility класс? → _utilities.scss
├── Это компонент-паттерн? → _components.scss
├── Это vendor override? → _vendor-overrides.scss
├── Это layout стиль? → _layout.scss
└── Это компонент-специфично? → component.scss файл
```

## 🎨 Color System Rules

### ✅ Правильное использование цветов
```scss
// ✅ Использовать CSS переменные
background-color: var(--os-color-primary);
border-color: var(--os-color-success);

// ✅ Использовать color maps
@include generate-os-colors('badge');

// ❌ НЕ использовать hardcoded
background-color: #f9a743; 
```

## 📱 Responsive Rules

### ✅ Единые breakpoints
```scss
// ✅ Использовать стандартные breakpoints
@media (max-width: 768px) { } // tablet
@media (max-width: 480px) { } // mobile

// ✅ Responsive mixins
@include responsive-spacing();
@include responsive-typography();
```

## 🔧 Import Rules

### ✅ Порядок импортов в component.scss
```scss
// 1. Foundation
@import "../../../../scss/variables";
@import "../../../../scss/mixins";

// 2. Specific mixins if needed
@import "../../../../scss/utilities"; // only if using utility maps

// 3. Component styles
.my-component {
  @include generate-os-colors('my-component');
}
```

## 📝 Development Workflow

### Before Adding Styles:
1. ❓ Есть ли уже подобный utility?
2. ❓ Можно ли использовать существующий mixin?
3. ❓ Соответствует ли стиль нашей системе размеров?
4. ❓ Использует ли стиль CSS переменные вместо hardcoded значений?

### Code Review Checklist:
- [ ] Нет дублирования существующих утилит
- [ ] Использованы CSS переменные вместо hardcoded цветов
- [ ] Соблюдена BEM методология
- [ ] Импорты в правильном порядке
- [ ] Responsive design учтен

## 🎯 Performance Guidelines

1. **Избегать deep nesting** (max 3 уровня)
2. **Использовать CSS custom properties** для runtime изменений
3. **Группировать related styles** в одном месте
4. **Минимизировать @import** в component файлах

## 📚 Examples

### ✅ Good Component SCSS
```scss
@import "../../../../scss/variables";
@import "../../../../scss/mixins";

.os-my-component {
  @include generate-os-colors('my-component');
  @include responsive-spacing();
  
  padding: map-get($spacing, '4');
  border-radius: map-get($border-radius, 'medium');
  
  &__element {
    font-size: map-get($font-sizes, 'sm');
  }
  
  &--variant {
    box-shadow: map-get($shadows, 'lg');
  }
}
```

### ❌ Bad Component SCSS
```scss
.my-component {
  padding: 16px; // hardcoded
  margin: 8px 12px 16px 4px; // inconsistent
  background: #f9a743; // hardcoded color
  border-radius: 6px; // magic number
  
  .element {
    font-size: 14px; // not BEM
  }
}
```

---

## 🚨 Dashboard Components Rule

### CRITICAL: Use Dashboard Mixins
**Always use dashboard mixins from `src/scss/_mixins.scss` instead of duplicating styles:**

```scss
// ✅ ALWAYS use these mixins for dashboard components
@include dashboard-card-header();        // Consistent headers (1.25rem, proper spacing)
@include dashboard-chart-container($h);  // Chart containers with proper sizing  
@include dashboard-kpi-grid($columns);   // Responsive KPI card grids
@include dashboard-chart-legend();       // Chart legends with colored dots
@include dashboard-demographics-row();   // Two-column responsive layout
@include dashboard-metric-summary();     // Metric displays (retention, churn rates)
@include dashboard-reason-bars();        // Horizontal bar charts for analysis
@include dashboard-dark-theme();         // Consistent dark theme support

// ❌ NEVER duplicate these patterns manually:
.card-header {
  display: flex;
  justify-content: space-between; // This is already in dashboard-card-header()
  // ...
}
```

### Chart Components Rule
```scss
// ✅ ALWAYS use for chart components
@include chart-complete($component-name, $icon);  // Full chart styling
@include chart-canvas($component-name);           // Canvas styling
@include chart-responsive($component-name);       // Responsive behavior
@include chart-accessibility($component-name);    // A11y support

// ❌ NEVER duplicate canvas overflow fixes manually:
.my-chart__container {
  overflow: hidden; // This is already in chart mixins
}
```

**🎯 Цель**: Maintainable, scalable, consistent SCSS architecture
**📏 Принцип**: DRY (Don't Repeat Yourself) + Single Source of Truth  
**🚀 Результат**: Faster development, easier maintenance, consistent UI