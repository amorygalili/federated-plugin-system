# Using Plugin Service in example-plugin-host

This guide shows how to integrate the plugin-service package into the example-plugin-host package to provide dynamic plugin management.

## Overview

The example-plugin-host is a Vite-based frontend application. To add dynamic plugin management, you can:

1. Create a separate backend server using plugin-service
2. Fetch the manifest from the backend in your frontend
3. Load plugins dynamically based on the manifest

## Implementation Steps

### Step 1: Create a Backend Server

Create a new file `packages/example-plugin-host/server.ts`:

```typescript
import { createPluginServiceApp } from 'plugin-service';

const app = createPluginServiceApp({
  dataPath: './plugin-data',
  baseUrl: 'http://localhost:3001',
  enableCors: true,
  serveUI: true,
  enableHealthCheck: true
});

app.listen(3001, () => {
  console.log('Plugin service running on http://localhost:3001');
  console.log('Management UI: http://localhost:3001/');
  console.log('\nManage your plugins at the UI, then refresh your app to load them.');
});
```

Or simply use the CLI:

```bash
# Run with default settings
npx plugin-service

# Or with custom options
plugin-service --port 3001 --data-path ./plugin-data
```

### Step 2: Update package.json

Add scripts to run the backend server:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "server": "tsx server.ts",
    "server:dev": "tsx watch server.ts",
    "dev:all": "concurrently \"npm run dev\" \"npm run server:dev\""
  },
  "devDependencies": {
    "tsx": "^4.6.2",
    "concurrently": "^8.2.2"
  },
  "dependencies": {
    "plugin-service": "workspace:*"
  }
}
```

### Step 3: Update Frontend to Fetch Manifest

Modify `packages/example-plugin-host/src/main.ts` to fetch the manifest from the backend:

```typescript
import { initFederation } from '@softarc/native-federation';

const PLUGIN_SERVICE_URL = 'http://localhost:3001';

async function loadPlugins() {
  try {
    // Fetch the manifest from the plugin service
    const response = await fetch(`${PLUGIN_SERVICE_URL}/api/manifest`);
    const result = await response.json();
    
    if (result.success) {
      const manifest = result.data;
      console.log('Loaded plugin manifest:', manifest);
      
      // Initialize federation with the dynamic manifest
      await initFederation(manifest);
      
      // Now you can load your app
      await import('./app');
    } else {
      console.error('Failed to load manifest:', result.error);
      // Fallback to static manifest or show error
    }
  } catch (error) {
    console.error('Error loading plugins:', error);
    // Fallback to static manifest or show error
  }
}

loadPlugins();
```

### Step 4: Run the Application

```bash
# Terminal 1: Run the plugin service
cd packages/example-plugin-host
npm run server:dev

# Or use the CLI directly
plugin-service --port 3001 --data-path ./plugin-data

# Terminal 2: Run the frontend
npm run dev

# Or run both together
npm run dev:all
```

### Step 5: Manage Plugins

1. Open the plugin management UI at `http://localhost:3001/`
2. Add plugins using the UI
3. Refresh your frontend app to load the new plugins

## Alternative: Embedded Server

If you want to embed the plugin service in the same server as your Vite dev server, you can create a custom Vite plugin:

### Create `packages/example-plugin-host/vite-plugin-service.ts`:

```typescript
import { Plugin } from 'vite';
import { createPluginServiceRouter } from 'plugin-service';
import express from 'express';

export function pluginServicePlugin(): Plugin {
  return {
    name: 'vite-plugin-service',
    configureServer(server) {
      const pluginRouter = createPluginServiceRouter({
        dataPath: './plugin-data',
        baseUrl: 'http://localhost:5173', // Vite's default port
        enableCors: true,
        serveUI: true,
        enableHealthCheck: true
      });

      // Mount the plugin service on the Vite dev server
      server.middlewares.use('/plugin-service', pluginRouter);
      
      console.log('Plugin service available at http://localhost:5173/plugin-service/');
    }
  };
}
```

### Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import { pluginServicePlugin } from './vite-plugin-service';

export default defineConfig({
  plugins: [
    pluginServicePlugin()
  ]
});
```

Now the plugin service will be available at `http://localhost:5173/plugin-service/` when running `npm run dev`.

## Complete Example

Here's a complete example of a dynamic plugin loader:

```typescript
// packages/example-plugin-host/src/plugin-loader.ts
import { initFederation } from '@softarc/native-federation';

export interface PluginLoaderOptions {
  serviceUrl: string;
  fallbackManifest?: Record<string, string>;
  onError?: (error: Error) => void;
}

export class PluginLoader {
  private options: PluginLoaderOptions;

  constructor(options: PluginLoaderOptions) {
    this.options = options;
  }

  async loadPlugins(): Promise<void> {
    try {
      const manifest = await this.fetchManifest();
      await initFederation(manifest);
      console.log('Plugins loaded successfully');
    } catch (error) {
      console.error('Failed to load plugins:', error);
      
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      
      // Try fallback manifest
      if (this.options.fallbackManifest) {
        console.log('Using fallback manifest');
        await initFederation(this.options.fallbackManifest);
      }
    }
  }

  private async fetchManifest(): Promise<Record<string, string>> {
    const response = await fetch(`${this.options.serviceUrl}/api/manifest`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Unknown error');
    }
    
    return result.data;
  }

  async addPlugin(name: string, url: string): Promise<void> {
    const response = await fetch(`${this.options.serviceUrl}/api/add-module`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, url })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to add plugin');
    }
  }

  async removePlugin(name: string): Promise<void> {
    const response = await fetch(`${this.options.serviceUrl}/api/remove-module`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to remove plugin');
    }
  }
}

// Usage in main.ts
const loader = new PluginLoader({
  serviceUrl: 'http://localhost:3001',
  fallbackManifest: {
    // Static fallback plugins
  },
  onError: (error) => {
    console.error('Plugin loader error:', error);
    // Show error UI
  }
});

await loader.loadPlugins();
```

## Benefits

1. **Dynamic Plugin Management**: Add/remove plugins without rebuilding
2. **Centralized Configuration**: Manage all plugins from one place
3. **Hot Reloading**: Update plugins and refresh to see changes
4. **Multiple Environments**: Different plugin configurations for dev/staging/prod
5. **Team Collaboration**: Share plugin configurations across team members

## Best Practices

1. **Cache the Manifest**: Cache the manifest in localStorage for faster loading
2. **Error Handling**: Always provide fallback manifests for critical plugins
3. **Version Control**: Keep a backup of your plugin configurations
4. **Security**: Add authentication to the plugin service in production
5. **Monitoring**: Log plugin loading success/failures for debugging

