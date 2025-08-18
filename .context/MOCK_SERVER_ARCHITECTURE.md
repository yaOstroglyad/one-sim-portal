# Mock Server Architecture

## Overview
This document describes the architecture for a selective mock server system that allows specific Angular services or endpoints to be mocked while keeping others connected to the real backend API.

## Key Features
- **Selective Mocking**: Only decorated services/methods use mock data
- **Transparent Integration**: No separate proxy configuration needed
- **Auto-start**: Mock server starts automatically with `npm start --mock`
- **JSON-based Data**: Easy to edit mock data in `/mock-server/data/`

## Architecture Components

### 1. Angular Decorators System
Decorators to mark services or methods for mocking:

```typescript
// Service-level mocking
@MockedService({
  endpoints: ['list', 'paginatedUsers', 'createUser']
})
export class UsersDataService { ... }

// Method-level mocking
export class UsersDataService {
  @MockedEndpoint()
  list(params?: any): Observable<any> { ... }
}
```

### 2. Mock Registry
Auto-generated registry file that tracks all mocked endpoints:

```json
// mock-server/registry.json
{
  "endpoints": [
    { "path": "/api/v1/users/query/all", "method": "GET", "handler": "users/list" },
    { "path": "/api/v1/users/command/create", "method": "POST", "handler": "users/create" }
  ]
}
```

### 3. Dynamic Proxy Configuration
Modified `proxy.conf.js` that routes based on mock registry:

```javascript
const mockRegistry = require('./mock-server/registry.json');
const isMockMode = process.env.MOCK_SERVER === 'true';

module.exports = {
  '/api': {
    target: 'https://esim-server.dev.global-sim.app',
    secure: false,
    changeOrigin: true,
    router: function(req) {
      if (isMockMode && isEndpointMocked(req.path, mockRegistry)) {
        return 'http://localhost:3001'; // Mock server
      }
      return 'https://esim-server.dev.global-sim.app'; // Real API
    }
  }
};
```

### 4. Mock Server Structure
```
/mock-server/
├── server.js                 # Express server entry point
├── registry.json            # Auto-generated from decorators
├── config.js               # Server configuration
├── data/                   # Mock data files
│   ├── users/
│   │   ├── list.json      # GET /api/v1/users/query/all
│   │   ├── create.json    # POST response template
│   │   └── [id].json      # GET /api/v1/users/{id}
│   ├── customers/
│   └── orders/
├── handlers/               # Request handlers
│   └── generic-handler.js  # Maps requests to JSON files
└── middleware/
    ├── delay.js           # Simulate network delays
    └── error-simulator.js # Simulate errors for testing
```

### 5. Mock Data Format

#### List Response (users/list.json)
```json
{
  "content": [
    {
      "username": "john.doe",
      "accountId": "ACC001",
      "accountType": "CORPORATE",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    }
  ],
  "totalElements": 150,
  "totalPages": 8,
  "number": 0,
  "size": 20
}
```

#### Single Entity (users/[id].json)
```json
{
  "username": "john.doe",
  "accountId": "ACC001",
  "accountType": "CORPORATE",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

### 6. NPM Scripts Integration
```json
{
  "scripts": {
    "mock-server": "node mock-server/server.js",
    "start": "ng serve --proxy-config proxy.conf.js",
    "start:mock": "cross-env MOCK_SERVER=true concurrently \"npm run mock-server\" \"npm start\"",
    "generate-mock-registry": "node scripts/generate-mock-registry.js"
  }
}
```

### 7. Development Workflow

1. **Mark service for mocking**:
   ```typescript
   @MockedService()
   export class UsersDataService { ... }
   ```

2. **Generate registry**:
   ```bash
   npm run generate-mock-registry
   ```

3. **Create mock data**:
   ```bash
   # Create mock data file
   touch mock-server/data/users/list.json
   ```

4. **Start with mocks**:
   ```bash
   npm start --mock
   ```

### 8. Advanced Features

#### Dynamic Data Generation
```javascript
// mock-server/handlers/users.js
module.exports = {
  list: (req, res) => {
    const page = req.query.page || 0;
    const size = req.query.size || 20;
    
    const users = generateUsers(size); // Using faker.js
    res.json({
      content: users,
      totalElements: 150,
      number: page,
      size: size
    });
  }
};
```

#### Stateful Mocking
```javascript
// In-memory database for CRUD operations
const mockDB = {
  users: new Map(),
  init() {
    // Load initial data from JSON files
  }
};
```

#### Error Simulation
```javascript
// Via query params: ?mock_error=500
// Via headers: X-Mock-Error: 404
// Via decorator config: @MockedEndpoint({ errorRate: 0.1 })
```

## Benefits
1. **Parallel Development**: Frontend can work without backend
2. **Testing Edge Cases**: Easy to test error scenarios
3. **Performance**: Instant responses for UI development
4. **Documentation**: Mock data serves as API contract
5. **Minimal Changes**: Only decorators needed in code

## Future Enhancements
1. **WebSocket Support**: Mock real-time events
2. **GraphQL Support**: Mock GraphQL endpoints
3. **Recording Mode**: Record real API responses as mocks
4. **Mock Data Validation**: Validate against TypeScript interfaces
5. **UI for Mock Management**: Web interface to edit mock data