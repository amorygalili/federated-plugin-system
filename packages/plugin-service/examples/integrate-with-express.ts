/**
 * Example: Integrating plugin-service into an existing Express application
 */

import express from 'express';
import { createPluginServiceRouter } from '../src/index';

const app = express();
const PORT = 3000;

// Your existing application routes
app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from main app!' });
});

app.get('/api/status', (_req, res) => {
  res.json({ 
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Mount the plugin service at /plugins
// This makes all plugin endpoints available under /plugins/*
const pluginRouter = createPluginServiceRouter({
  dataPath: './example-data',
  baseUrl: `http://localhost:${PORT}`,
  enableCors: true,
  serveUI: true,
  enableHealthCheck: true
});

app.use('/plugins', pluginRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Main app endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/api/hello`);
  console.log(`  GET  http://localhost:${PORT}/api/status`);
  console.log(`\nPlugin service endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/plugins/api/manifest`);
  console.log(`  POST http://localhost:${PORT}/plugins/api/add-module`);
  console.log(`  POST http://localhost:${PORT}/plugins/api/remove-module`);
  console.log(`  POST http://localhost:${PORT}/plugins/api/update-module`);
  console.log(`  GET  http://localhost:${PORT}/plugins/api/modules`);
  console.log(`  GET  http://localhost:${PORT}/plugins/ (Management UI)`);
});

