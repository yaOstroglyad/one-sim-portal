<!--
API Documentation Generator

Использование:
  Прочитай .claude/prompts/api-docs-generator.md и примени к путь/к/Controller.java

Примеры:
  Прочитай .claude/prompts/api-docs-generator.md и примени к src/main/java/com/example/ProductController.java
  Прочитай .claude/prompts/api-docs-generator.md и примени к ProductController.java и ProductDTO.java
-->

Сгенерируй Markdown документацию для REST API на основе предоставленного кода.

## Требования

**Язык:** английский

**Стиль:**
- Активный залог: "Returns a list" (не "A list is returned")
- Второе лицо: "You can filter" (не "Users can filter")
- Краткость: 1 предложение на описание эндпоинта

**Структура документа:**
- `# H1` — название API (один раз)
- `## H2` — разделы (Overview, Endpoints, Errors)
- `### H3` — отдельные эндпоинты

**Для каждого эндпоинта:**
1. Описание (1 предложение)
2. HTTP метод и путь в блоке ```http
3. Path Parameters — таблица (если есть)
4. Query Parameters — таблица (если есть)
5. Request Body — пример JSON + таблица полей (если есть)
6. Response — пример JSON + таблица полей
7. Error Responses — таблица

**Данные в примерах:**
- Реалистичные значения (не "string", "test", "example")
- JSON с отступом 2 пробела

**Формат таблиц:**
```
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
```

## Пример вывода

```markdown
### Get Customer Balance

Retrieves aggregated bundle usage for a customer.

**Endpoint:**

\`\`\`http
GET /api/public/balance/customer/{customerIdentifier}
\`\`\`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customerIdentifier` | string | Yes | Unique customer ID |

**Response:**

\`\`\`json
{
  "id": "bundle_8f14e45f",
  "status": "ACTIVE",
  "remaining": 2.5
}
\`\`\`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Bundle identifier |
| `status` | string | Status: `ACTIVE`, `EXPIRED` |
| `remaining` | number | Remaining data in GB |

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 404 | `NOT_FOUND` | Customer not found |
```
