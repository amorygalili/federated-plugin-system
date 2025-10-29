# Plugin System for Native Federation

This plugin system allows you to dynamically load and manage microfrontend modules using native federation. It consists of several components that work together to provide a complete plugin management solution.

## Architecture

The plugin system consists of:

1. **Plugin Service** (`packages/plugin-service`) - Backend service for managing plugins
2. **Plugin System** (`packages/plugin-system`) - Frontend module that provides the `getPlugins<T>()` function
3. **Management UI** - Web interface for adding/removing plugins (served by plugin service)
4. **Example Plugin** (`packages/example-plugin`) - Demonstrates how to create a plugin
5. **Plugin Host** (`packages/example-plugin-host`) - Example host application that uses plugins

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Start the Plugin System

Start all plugin-related services:

```bash
pnpm run:plugins
```

This will start:
- Plugin Service on http://localhost:3001
- Plugin System on http://localhost:3002  
- Example Plugin on http://localhost:3003
- Plugin Host on http://localhost:3004

### 3. Add a Plugin

1. Open the Plugin Management UI: http://localhost:3001
2. Add the example plugin:
   - Name: `example-plugin`
   - Type: `URL`
   - Location: `http://localhost:3003/remoteEntry.json`
3. Click "Add Module"

### 4. Test the Plugin System

1. Open the Plugin Host Demo: http://localhost:3004
2. You should see the loaded plugins and be able to execute them

## Components

### Plugin Service

**Location:** `packages/plugin-service`
**Port:** 3001

The backend service provides:

- **GET /api/manifest** - Returns the manifest generated from registered modules
- **POST /api/add-module** - Adds a module to the manifest
- **POST /api/remove-module** - Removes a module from the manifest  
- **POST /api/update-module** - Updates a module in the manifest
- **GET /api/modules** - Returns all registered modules
- **GET /** - Serves the management UI
- **/modules/{name}/** - Serves local module files

### Plugin System Frontend Module

**Location:** `packages/plugin-system`
**Port:** 3002

Exposes the `./pluginLoader` module with:

```typescript
// Main function to get all plugins
async function getPlugins<T>(manifestUrl: string): Promise<T[]>

// Plugin loader class for advanced usage
class PluginLoader {
  constructor(config: PluginSystemConfig)
  async getPlugins<T>(): Promise<T[]>
  clearCache(): void
  async getManifest(): Promise<PluginManifest>
}
```

### Creating a Plugin

A plugin must:

1. Be a native federation module
2. Expose a `./plugin` module
3. Have a default export of your plugin type

Example plugin structure:

```typescript
// src/federation.ts
module.exports = withNativeFederation({
  name: "my-plugin",
  exposes: {
    "./plugin": "./src/plugin.ts",
  },
  // ... other config
});

// src/plugin.ts
interface MyPlugin {
  name: string;
  execute(data?: any): any;
}

class MyPluginImpl implements MyPlugin {
  name = "My Plugin";
  
  execute(data?: any): any {
    return { message: "Hello from plugin!", data };
  }
}

export default new MyPluginImpl();
```

### Using the Plugin System

In your host application:

```typescript
import { loadRemoteModule } from "@softarc/native-federation";

// Load the plugin system
const { getPlugins } = await loadRemoteModule({
  remoteName: "plugin-system",
  exposedModule: "./pluginLoader",
});

// Get all plugins
const plugins = await getPlugins<MyPluginInterface>(
  "http://localhost:3001/api/manifest"
);

// Use the plugins
plugins.forEach(plugin => {
  plugin.initialize?.();
  const result = plugin.execute(someData);
  console.log(result);
});
```

## Plugin Types

### URL Plugins
- Hosted remotely
- Specified by their remoteEntry.json URL
- Loaded directly from the URL

### Local Plugins  
- Stored locally on the plugin service
- Uploaded as folder containing remoteEntry.json
- Served under `/modules/{name}/` path

## Management UI

The management UI (http://localhost:3001) allows you to:

- View all registered plugins
- Add new plugins (URL or local path)
- Remove existing plugins
- See plugin metadata (name, type, creation date)

## API Reference

### Plugin Service API

#### GET /api/manifest
Returns the native federation manifest.

**Response:**
```json
{
  "success": true,
  "data": {
    "plugin-name": "http://localhost:3003/remoteEntry.json"
  }
}
```

#### POST /api/add-module
Adds a new plugin module.

**Request:**
```json
{
  "name": "my-plugin",
  "url": "http://localhost:3003/remoteEntry.json"
}
```

**Response:**
```json
{
  "success": true,
  "data": [/* array of all modules */]
}
```

#### POST /api/remove-module
Removes a plugin module.

**Request:**
```json
{
  "name": "my-plugin"
}
```

#### POST /api/update-module
Updates an existing plugin module.

**Request:**
```json
{
  "name": "my-plugin",
  "url": "http://localhost:3004/remoteEntry.json"
}
```

## Development

### Running Individual Services

```bash
# Plugin service only
pnpm run:plugin-service

# Plugin system only  
pnpm run:plugin-system

# Example plugin only
pnpm run:example-plugin

# Plugin host only
pnpm run:plugin-host
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter plugin-service run build
```

## Troubleshooting

### Plugin Service Won't Start
- Check if port 3001 is available
- Ensure all dependencies are installed: `pnpm install`

### Plugins Not Loading
- Verify the plugin service is running on port 3001
- Check that plugins are properly registered in the management UI
- Ensure plugin modules expose `./plugin` correctly
- Check browser console for federation errors

### CORS Issues
- The plugin service includes CORS headers
- For production, configure CORS properly for your domains

### Plugin Not Found
- Verify the plugin's remoteEntry.json is accessible
- Check the plugin's federation configuration
- Ensure the plugin exposes `./plugin` module

## Production Deployment

For production:

1. Build all packages: `pnpm build`
2. Deploy the plugin service with proper database storage
3. Configure CORS for your domains
4. Use HTTPS for all plugin URLs
5. Implement proper authentication/authorization
6. Consider plugin sandboxing and security

## Security Considerations

- Validate plugin sources before loading
- Implement authentication for plugin management
- Consider plugin sandboxing
- Audit plugin code before deployment
- Use HTTPS for all plugin communications
