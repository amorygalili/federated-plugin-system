# Integration Guide

This guide shows how to integrate the plugin-service package into your applications.

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Integration Patterns](#integration-patterns)
4. [API Reference](#api-reference)
5. [Examples](#examples)

## Installation

```bash
# In your project
npm install plugin-service

# Or if using in the monorepo
npm install plugin-service --workspace=your-package
```

## Quick Start

### Option 1: Standalone Server (CLI)

The simplest way to run the plugin service:

```bash
# Run with default settings
npx plugin-service

# Run with custom configuration
plugin-service --port 4000 --data-path ./my-plugins --base-url http://myserver.com:4000

# Or using short options
plugin-service -p 4000 -d ./my-plugins -b http://myserver.com:4000
```

### Option 2: Express Router (Recommended for Integration)

Mount the plugin service in your existing Express app:

```typescript
import express from 'express';
import { createPluginServiceRouter } from 'plugin-service';

const app = express();

// Your existing routes
app.get('/api/data', (req, res) => {
  res.json({ data: 'your data' });
});

// Add plugin service at /plugins
app.use('/plugins', createPluginServiceRouter({
  dataPath: './plugins-data',
  baseUrl: 'http://localhost:3000'
}));

app.listen(3000);
```

### Option 3: Standalone App

Create a complete Express app with plugin service:

```typescript
import { createPluginServiceApp } from 'plugin-service';

const app = createPluginServiceApp({
  dataPath: './data',
  baseUrl: 'http://localhost:3001'
});

app.listen(3001);
```

## Integration Patterns

### Pattern 1: Microservice Architecture

Run plugin-service as a separate microservice:

```typescript
// plugin-service.ts
import { createPluginServiceApp } from 'plugin-service';

const app = createPluginServiceApp({
  dataPath: process.env.DATA_PATH || './data',
  baseUrl: process.env.BASE_URL || 'http://localhost:3001',
  enableCors: true
});

app.listen(3001, () => {
  console.log('Plugin service running on port 3001');
});
```

Then consume it from your main app:

```typescript
// main-app.ts
const PLUGIN_SERVICE_URL = 'http://localhost:3001';

async function getPluginManifest() {
  const response = await fetch(`${PLUGIN_SERVICE_URL}/api/manifest`);
  return response.json();
}
```

### Pattern 2: Embedded Service

Embed the plugin service directly in your application:

```typescript
import express from 'express';
import { createPluginServiceRouter } from 'plugin-service';

const app = express();

// Your app's routes
app.use('/api', yourApiRouter);

// Plugin management
app.use('/admin/plugins', createPluginServiceRouter({
  dataPath: './data/plugins',
  baseUrl: 'http://localhost:3000',
  serveUI: true // Enable management UI
}));

app.listen(3000);
```

### Pattern 3: Programmatic Control

Use the Database class directly for full control:

```typescript
import { Database } from 'plugin-service';

class PluginManager {
  private db: Database;

  constructor() {
    this.db = new Database('./plugins', 'http://localhost:3000');
  }

  async addPlugin(name: string, url: string) {
    return this.db.addModule(name, url);
  }

  async getManifest() {
    return this.db.generateManifest();
  }

  async removePlugin(name: string) {
    return this.db.removeModule(name);
  }
}

const manager = new PluginManager();
```

## API Reference

### `createPluginServiceRouter(options?)`

Creates an Express Router that can be mounted on any Express app.

**Parameters:**
- `options` (optional): `PluginServiceOptions`

**Returns:** `Router`

**Example:**
```typescript
const router = createPluginServiceRouter({
  dataPath: './data',
  enableCors: true,
  serveUI: true
});
app.use('/plugins', router);
```

### `createPluginServiceApp(options?)`

Creates a complete Express application with plugin service.

**Parameters:**
- `options` (optional): `PluginServiceOptions`

**Returns:** `Express`

**Example:**
```typescript
const app = createPluginServiceApp({
  dataPath: './data',
  baseUrl: 'http://localhost:3001'
});
app.listen(3001);
```

### `Database`

Direct access to the plugin database.

**Constructor:**
```typescript
new Database(dataPath?: string, baseUrl?: string)
```

**Methods:**
- `addModule(name, url?, path?)`: Add a new module
- `updateModule(name, url?, path?)`: Update an existing module
- `removeModule(name)`: Remove a module
- `getModuleByName(name)`: Get a specific module
- `getAllModules()`: Get all modules
- `generateManifest()`: Generate the module manifest
- `getModulesDirectory()`: Get the modules directory path

## Examples

### Example 1: Multi-tenant Plugin System

```typescript
import express from 'express';
import { createPluginServiceRouter } from 'plugin-service';

const app = express();

// Create separate plugin services for different tenants
const tenants = ['tenant1', 'tenant2', 'tenant3'];

tenants.forEach(tenant => {
  const router = createPluginServiceRouter({
    dataPath: `./data/${tenant}`,
    baseUrl: `http://localhost:3000/${tenant}`,
    serveUI: false // Use custom UI
  });
  
  app.use(`/${tenant}/plugins`, router);
});

app.listen(3000);
```

### Example 2: Plugin Service with Authentication

```typescript
import express from 'express';
import { createPluginServiceRouter } from 'plugin-service';

const app = express();

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || token !== 'Bearer secret-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Protected plugin service
const pluginRouter = createPluginServiceRouter({
  dataPath: './secure-plugins',
  serveUI: true
});

app.use('/admin/plugins', authenticate, pluginRouter);

app.listen(3000);
```

### Example 3: Dynamic Plugin Loading

```typescript
import { Database } from 'plugin-service';

class DynamicPluginLoader {
  private db: Database;

  constructor() {
    this.db = new Database('./plugins', 'http://localhost:3000');
  }

  async loadPluginsFromConfig(config: any) {
    for (const plugin of config.plugins) {
      try {
        await this.db.addModule(plugin.name, plugin.url);
        console.log(`Loaded plugin: ${plugin.name}`);
      } catch (error) {
        console.error(`Failed to load plugin ${plugin.name}:`, error);
      }
    }
  }

  getManifestForClient() {
    return this.db.generateManifest();
  }
}

// Usage
const loader = new DynamicPluginLoader();
await loader.loadPluginsFromConfig({
  plugins: [
    { name: 'plugin1', url: 'http://cdn.example.com/plugin1/remoteEntry.json' },
    { name: 'plugin2', url: 'http://cdn.example.com/plugin2/remoteEntry.json' }
  ]
});
```

## Best Practices

1. **Use Environment Variables**: Configure paths and URLs via environment variables for different environments
2. **Separate Data Directories**: Use different data directories for development, staging, and production
3. **Enable CORS Carefully**: Only enable CORS when necessary and configure it properly
4. **Secure the Management UI**: Add authentication when exposing the management UI
5. **Monitor Plugin Health**: Implement health checks for loaded plugins
6. **Version Your Plugins**: Use versioned URLs for plugin modules
7. **Backup Plugin Data**: Regularly backup the modules.json file

## Troubleshooting

### Issue: Modules not loading

**Solution:** Check that the `baseUrl` matches your server's actual URL and port.

### Issue: CORS errors

**Solution:** Enable CORS in the options or configure it properly in your main app.

### Issue: Management UI not showing

**Solution:** Ensure `serveUI: true` is set and you're accessing the root path of the mounted router.

### Issue: Local modules not found

**Solution:** Verify the `dataPath` is correct and the modules directory has proper permissions.

