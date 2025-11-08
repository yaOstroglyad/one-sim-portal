# HTTP Integration - Adding API Endpoints

> **Context Tags:** `@extending` `@http`
> **Read when:** Adding HTTP endpoints to existing service

## 📋 Quick Reference

**Array endpoint:**
```typescript
list(): Observable<Entity[]> {
  return this.http.get<Entity[]>('/api/v1/entities').pipe(
    catchError(handleArrayError<Entity>('fetching entities'))
  );
}
```

**Object endpoint:**
```typescript
getById(id: string): Observable<Entity | null> {
  return this.http.get<Entity>(`/api/v1/entities/${id}`).pipe(
    catchError(handleObjectError<Entity>('fetching entity'))
  );
}
```

**With caching:**
```typescript
list(): Observable<Entity[]> {
  return this.cacheHub.get(
    'entities:list',
    () => this.http.get<Entity[]>('/api/v1/entities'),
    { dataType: DataType.BUSINESS }
  ).pipe(
    catchError(handleArrayError<Entity>('fetching entities'))
  );
}
```

**Mutation (create/update/delete):**
```typescript
create(entity: Entity): Observable<Entity | null> {
  return this.http.post<Entity>('/api/v1/entities', entity).pipe(
    tap(() => this.cacheHub.invalidatePattern('default:entities:')),
    catchError(handleObjectError<Entity>('creating entity'))
  );
}
```

## 📚 Related
- [HTTP Error Rules](../rules/02-http-errors.md)
- [Common Patterns](../context/common-patterns.md)
