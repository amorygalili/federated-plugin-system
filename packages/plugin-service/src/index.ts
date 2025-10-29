import express from 'express';
import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Database } from './database';
import { createRoutes } from './routes';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use(createRoutes(db));

// Static file serving for local modules
// Serve module files under /modules/{name} path
app.use('/modules/:name', (req, res, next) => {
  const moduleName = req.params.name;
  const modulePath = path.join(db.getModulesDirectory(), moduleName);

  // Check if the module directory exists
  if (fs.existsSync(modulePath)) {
    express.static(modulePath)(req, res, next);
  } else {
    res.status(404).json({ error: `Module '${moduleName}' not found` });
  }
});

// Serve the management UI
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for the management UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

app.listen(PORT, () => {
  console.log(`Plugin service running on port ${PORT}`);
  console.log(`Management UI available at http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /api/manifest`);
  console.log(`  POST /api/add-module`);
  console.log(`  POST /api/remove-module`);
  console.log(`  POST /api/update-module`);
  console.log(`  GET  /api/modules`);
});
