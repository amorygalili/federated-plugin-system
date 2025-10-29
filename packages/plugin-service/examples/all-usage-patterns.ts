/**
 * Comprehensive example showing all usage patterns for plugin-service
 */

import express from 'express';
import { 
  createPluginServiceRouter, 
  createPluginServiceApp, 
  Database,
  PluginServiceOptions 
} from '../src/index';

console.log('=== Plugin Service - All Usage Patterns ===\n');

// ============================================================================
// Pattern 1: CLI Usage (command-line)
// ============================================================================
console.log('Pattern 1: CLI Usage');
console.log('-------------------');
console.log('Run from command line:');
console.log('  plugin-service');
console.log('  plugin-service --port 4000');
console.log('  plugin-service -p 4000 -d ./plugins -b http://localhost:4000');
console.log('  plugin-service --no-ui --no-cors\n');

// ============================================================================
// Pattern 2: Express Router (mount on existing app)
// ============================================================================
console.log('Pattern 2: Express Router (Embedded)');
console.log('------------------------------------');

function pattern2_expressRouter() {
  const app = express();
  
  // Your existing routes
  app.get('/api/hello', (_req, res) => {
    res.json({ message: 'Hello from main app' });
  });
  
  // Mount plugin service at /plugins
  const pluginRouter = createPluginServiceRouter({
    dataPath: './pattern2-data',
    baseUrl: 'http://localhost:3000',
    enableCors: true,
    serveUI: true,
    enableHealthCheck: true
  });
  
  app.use('/plugins', pluginRouter);
  
  console.log('✓ Plugin service mounted at /plugins');
  console.log('  Main app: http://localhost:3000/api/hello');
  console.log('  Plugins: http://localhost:3000/plugins/api/manifest\n');
  
  return app;
}

// ============================================================================
// Pattern 3: Standalone App
// ============================================================================
console.log('Pattern 3: Standalone App');
console.log('------------------------');

function pattern3_standaloneApp() {
  const app = createPluginServiceApp({
    dataPath: './pattern3-data',
    baseUrl: 'http://localhost:3001',
    enableCors: true,
    serveUI: true,
    enableHealthCheck: true
  });
  
  // You can still add custom routes
  app.get('/custom', (_req, res) => {
    res.json({ message: 'Custom endpoint' });
  });
  
  console.log('✓ Standalone app created');
  console.log('  Plugins: http://localhost:3001/api/manifest');
  console.log('  Custom: http://localhost:3001/custom\n');
  
  return app;
}

// ============================================================================
// Pattern 4: Programmatic Database Access
// ============================================================================
console.log('Pattern 4: Programmatic Database Access');
console.log('---------------------------------------');

function pattern4_programmaticAccess() {
  const db = new Database('./pattern4-data', 'http://localhost:3002');
  
  // Add modules
  db.addModule('plugin1', 'http://example.com/plugin1/remoteEntry.json');
  db.addModule('plugin2', 'http://example.com/plugin2/remoteEntry.json');
  
  // Get manifest
  const manifest = db.generateManifest();
  console.log('✓ Manifest generated:', manifest);
  
  // Get all modules
  const modules = db.getAllModules();
  console.log(`✓ Total modules: ${modules.length}`);
  
  // Update a module
  db.updateModule('plugin1', 'http://example.com/plugin1/v2/remoteEntry.json');
  console.log('✓ Module updated');
  
  // Remove a module
  db.removeModule('plugin2');
  console.log('✓ Module removed\n');
  
  return db;
}

// ============================================================================
// Pattern 5: Multiple Instances (Multi-tenant)
// ============================================================================
console.log('Pattern 5: Multiple Instances (Multi-tenant)');
console.log('--------------------------------------------');

function pattern5_multiTenant() {
  const app = express();
  
  const tenants = ['tenant1', 'tenant2', 'tenant3'];
  
  tenants.forEach(tenant => {
    const router = createPluginServiceRouter({
      dataPath: `./pattern5-data/${tenant}`,
      baseUrl: `http://localhost:3003/${tenant}`,
      serveUI: false // Use custom UI
    });
    
    app.use(`/${tenant}/plugins`, router);
    console.log(`✓ Plugin service for ${tenant} mounted at /${tenant}/plugins`);
  });
  
  console.log();
  return app;
}

// ============================================================================
// Pattern 6: Custom Configuration
// ============================================================================
console.log('Pattern 6: Custom Configuration');
console.log('-------------------------------');

function pattern6_customConfig() {
  const config: PluginServiceOptions = {
    dataPath: process.env.PLUGIN_DATA_PATH || './pattern6-data',
    baseUrl: process.env.PLUGIN_BASE_URL || 'http://localhost:3004',
    enableCors: process.env.ENABLE_CORS !== 'false',
    serveUI: process.env.SERVE_UI !== 'false',
    enableHealthCheck: process.env.ENABLE_HEALTH_CHECK !== 'false'
  };
  
  const app = createPluginServiceApp(config);
  
  console.log('✓ App created with custom configuration');
  console.log('  Config:', config);
  console.log();
  
  return app;
}

// ============================================================================
// Pattern 7: With Authentication
// ============================================================================
console.log('Pattern 7: With Authentication');
console.log('------------------------------');

function pattern7_withAuth() {
  const app = express();
  
  // Simple authentication middleware
  const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization;
    if (!token || token !== 'Bearer secret-token') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  };
  
  // Protected plugin service
  const pluginRouter = createPluginServiceRouter({
    dataPath: './pattern7-data',
    baseUrl: 'http://localhost:3005',
    serveUI: true
  });
  
  app.use('/admin/plugins', authenticate, pluginRouter);
  
  console.log('✓ Plugin service with authentication');
  console.log('  Access requires: Authorization: Bearer secret-token\n');
  
  return app;
}

// ============================================================================
// Pattern 8: API-Only (No UI)
// ============================================================================
console.log('Pattern 8: API-Only (No UI)');
console.log('---------------------------');

function pattern8_apiOnly() {
  const app = createPluginServiceApp({
    dataPath: './pattern8-data',
    baseUrl: 'http://localhost:3006',
    enableCors: true,
    serveUI: false, // No UI
    enableHealthCheck: true
  });
  
  console.log('✓ API-only service (no UI)');
  console.log('  Only API endpoints available\n');
  
  return app;
}

// ============================================================================
// Pattern 9: Dynamic Plugin Loader
// ============================================================================
console.log('Pattern 9: Dynamic Plugin Loader');
console.log('--------------------------------');

class DynamicPluginLoader {
  private db: Database;
  
  constructor(dataPath: string, baseUrl: string) {
    this.db = new Database(dataPath, baseUrl);
  }
  
  async loadFromConfig(config: { plugins: Array<{ name: string; url: string }> }) {
    for (const plugin of config.plugins) {
      try {
        this.db.addModule(plugin.name, plugin.url);
        console.log(`  ✓ Loaded: ${plugin.name}`);
      } catch (error) {
        console.log(`  ✗ Failed: ${plugin.name}`);
      }
    }
  }
  
  getManifest() {
    return this.db.generateManifest();
  }
}

function pattern9_dynamicLoader() {
  const loader = new DynamicPluginLoader('./pattern9-data', 'http://localhost:3007');
  
  loader.loadFromConfig({
    plugins: [
      { name: 'analytics', url: 'http://cdn.example.com/analytics/remoteEntry.json' },
      { name: 'dashboard', url: 'http://cdn.example.com/dashboard/remoteEntry.json' }
    ]
  });
  
  const manifest = loader.getManifest();
  console.log('  Manifest:', manifest);
  console.log();
  
  return loader;
}

// ============================================================================
// Run Examples
// ============================================================================

console.log('\n=== Running Examples ===\n');

// Run programmatic examples
pattern4_programmaticAccess();
pattern9_dynamicLoader();

console.log('=== Examples Complete ===\n');
console.log('To run the server examples, uncomment the following lines:\n');
console.log('// const app2 = pattern2_expressRouter();');
console.log('// app2.listen(3000);');
console.log('//');
console.log('// const app3 = pattern3_standaloneApp();');
console.log('// app3.listen(3001);');
console.log('//');
console.log('// const app5 = pattern5_multiTenant();');
console.log('// app5.listen(3003);');
console.log('//');
console.log('// const app6 = pattern6_customConfig();');
console.log('// app6.listen(3004);');
console.log('//');
console.log('// const app7 = pattern7_withAuth();');
console.log('// app7.listen(3005);');
console.log('//');
console.log('// const app8 = pattern8_apiOnly();');
console.log('// app8.listen(3006);');

