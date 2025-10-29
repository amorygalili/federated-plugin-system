/**
 * Example: Using plugin-service as a standalone Express app
 */

import { createPluginServiceApp } from '../src/index';

const PORT = 3001;

// Create a complete Express app with plugin service
const app = createPluginServiceApp({
  dataPath: './standalone-data',
  baseUrl: `http://localhost:${PORT}`,
  enableCors: true,
  serveUI: true,
  enableHealthCheck: true
});

// You can still add custom routes if needed
app.get('/custom', (_req, res) => {
  res.json({ message: 'Custom endpoint added to plugin service app' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Plugin service running on http://localhost:${PORT}`);
  console.log(`Management UI: http://localhost:${PORT}/`);
  console.log(`\nAPI endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/api/manifest`);
  console.log(`  POST http://localhost:${PORT}/api/add-module`);
  console.log(`  POST http://localhost:${PORT}/api/remove-module`);
  console.log(`  POST http://localhost:${PORT}/api/update-module`);
  console.log(`  GET  http://localhost:${PORT}/api/modules`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`\nCustom endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/custom`);
});

