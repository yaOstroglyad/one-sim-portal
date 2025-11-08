# Creating a Service - Step by Step

> **Context Tags:** `@creating-new` `@service`
> **Read when:** Creating a new service

## 📋 Checklist
- [ ] Check if similar service exists
- [ ] Decide category: data/, ui/, or core/

## 🚀 Steps

### 1. Search Existing
```bash
grep -r "ServiceName" /Users/andreyostroglyad/IdeaProjects/quantum-soft/one-sim-portal/src/app/shared/services
```

See: [.claude/rules/04-services.md](../rules/04-services.md)

### 2. Choose Category
- **data/** - API/CRUD operations
- **ui/** - UI state, preferences
- **core/** - Base classes, utilities

### 3. Create Service
Use template: `.claude/templates/service.template.ts`

### 4. Apply Pattern
- ✅ Use `inject()` for dependencies
- ✅ Add error handling (handleArrayError, handleObjectError)
- ✅ Use CacheHubService for GET requests
- ✅ Invalidate cache on mutations
- ✅ Include namespace in cache keys: `'default:resource:*'`

See: [.claude/context/common-patterns.md](../context/common-patterns.md#data-service-pattern)

### 5. Update Barrel Export
```typescript
// /shared/services/data/index.ts
export * from './my-resource-data.service';
```

## 📚 Related
- [Service Rules](../rules/04-services.md)
- [HTTP Errors](../rules/02-http-errors.md)
- [Service Template](../templates/service.template.ts)
