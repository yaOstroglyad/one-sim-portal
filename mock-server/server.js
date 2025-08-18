const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.MOCK_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[MOCK] ${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Delay middleware (optional, to simulate network latency)
app.use((req, res, next) => {
  const delay = req.query.mock_delay || 100;
  setTimeout(next, delay);
});

// Helper function to read JSON data
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// Users endpoints
app.get('/api/v1/users/query/all', (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 20;
  const sort = req.query.sort;
  
  const allUsers = readJsonFile(path.join(__dirname, 'data/users/list.json'));
  
  if (!allUsers) {
    return res.status(500).json({ error: 'Failed to load users data' });
  }
  
  // Simple pagination
  const start = page * size;
  const end = start + size;
  const paginatedContent = allUsers.content.slice(start, end);
  
  // Filter by search params
  let filteredContent = paginatedContent;
  if (req.query.username) {
    filteredContent = filteredContent.filter(u => 
      u.username.toLowerCase().includes(req.query.username.toLowerCase())
    );
  }
  if (req.query.email) {
    filteredContent = filteredContent.filter(u => 
      u.email.toLowerCase().includes(req.query.email.toLowerCase())
    );
  }
  if (req.query.accountType) {
    filteredContent = filteredContent.filter(u => 
      u.accountType === req.query.accountType
    );
  }
  
  res.json({
    content: filteredContent,
    totalElements: allUsers.totalElements,
    totalPages: Math.ceil(allUsers.totalElements / size),
    number: page,
    size: size,
    sort: {
      sorted: !!sort,
      unsorted: !sort,
      empty: !sort
    },
    first: page === 0,
    last: page >= Math.ceil(allUsers.totalElements / size) - 1,
    numberOfElements: filteredContent.length,
    empty: filteredContent.length === 0
  });
});

app.post('/api/v1/users/command/create', (req, res) => {
  const accountId = req.query.accountId;
  const userData = req.body;
  
  // Simulate created user response
  const createdUser = {
    ...userData,
    id: `USER-${Date.now()}`,
    accountId: accountId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'ACTIVE'
  };
  
  console.log('[MOCK] Created user:', createdUser);
  
  res.status(201).json(createdUser);
});

app.get('/api/v1/users/query/verify-user', (req, res) => {
  const email = req.query.email;
  const verifyData = readJsonFile(path.join(__dirname, 'data/users/verify-email.json'));
  
  if (!verifyData) {
    return res.status(500).json({ error: 'Failed to load verify data' });
  }
  
  const isExist = verifyData.existingEmails.includes(email);
  
  res.json({ isExist });
});

// Error simulation endpoint
app.use((req, res, next) => {
  if (req.query.mock_error) {
    const errorCode = parseInt(req.query.mock_error);
    return res.status(errorCode).json({
      error: `Mock error ${errorCode}`,
      message: 'This is a simulated error for testing'
    });
  }
  next();
});

// Catch all - return 404 for unhandled endpoints
app.use((req, res) => {
  console.log(`[MOCK] Unhandled endpoint: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Not Found',
    message: `Mock endpoint not implemented: ${req.method} ${req.url}`,
    hint: 'Add this endpoint to mock-server/server.js'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                  Mock Server Started                   ║
╠═══════════════════════════════════════════════════════╣
║  Port: ${PORT}                                            ║
║  Users API: http://localhost:${PORT}/api/v1/users        ║
║                                                        ║
║  Available endpoints:                                  ║
║  - GET  /api/v1/users/query/all                      ║
║  - POST /api/v1/users/command/create                 ║
║  - GET  /api/v1/users/query/verify-user              ║
║                                                        ║
║  Query params:                                         ║
║  - ?mock_delay=500 (simulate delay in ms)            ║
║  - ?mock_error=500 (simulate HTTP error)             ║
╚═══════════════════════════════════════════════════════╝
  `);
});