# Federated Plugin System

A dynamic plugin management system built with Native Federation that enables microfrontend modules to be loaded, managed, and executed at runtime. This monorepo provides a complete solution for building extensible applications with a plugin architecture.

## 🌟 Features

- **Dynamic Plugin Loading** - Load and unload plugins at runtime without rebuilding your application
- **Native Federation** - Built on [@softarc/native-federation](https://www.npmjs.com/package/@softarc/native-federation) for modern module federation
- **Plugin Management UI** - Web-based interface for managing plugins
- **REST API** - Complete API for programmatic plugin management
- **TypeScript Support** - Fully typed plugin system with TypeScript
- **Multiple Plugin Sources** - Support for both URL-based and locally hosted plugins
- **Example Implementation** - Includes working examples of both plugin host and plugin

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Creating Plugins](#creating-plugins)
- [API Reference](#api-reference)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## 🏗️ Architecture

The system consists of four main packages:

1. **Plugin Service** (`packages/plugin-service`) - Express-based backend service that manages plugin registration and serves the management UI
2. **Plugin System** (`packages/plugin-system`) - Frontend library that provides the `getPlugins<T>()` function for loading plugins
3. **Example Plugin** (`packages/example-plugin`) - Sample plugin demonstrating the plugin interface
4. **Example Plugin Host** (`packages/example-plugin-host`) - Sample host application showing how to consume plugins

```
┌─────────────────────┐
│  Plugin Host App    │
│  (Port 3004)        │
└──────────┬──────────┘
           │
           │ Uses getPlugins()
           ▼
┌─────────────────────┐      ┌──────────────────┐
│  Plugin System      │◄─────┤  Plugin Service  │
│  (Library)          │      │  (Port 3001)     │
└──────────┬──────────┘      └────────┬─────────┘
           │                          │
           │ Loads                    │ Manages
           ▼                          ▼
┌─────────────────────┐      ┌──────────────────┐
│  Example Plugin     │      │  Plugin Registry │
│  (Port 3003)        │      │  & Management UI │
└─────────────────────┘      └──────────────────┘
```

## ✅ Prerequisites

- **Node.js** - Version 18 or higher
- **pnpm** - Version 8 or higher (recommended package manager)

To install pnpm:
```bash
npm install -g pnpm
```

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd federated-plugin-system
```

2. Install dependencies:
```bash
pnpm install
```

3. Build all packages:
```bash
pnpm build
```

## 🚀 Quick Start

### Start All Services

The easiest way to get started is to run all services together:

```bash
pnpm run:plugins
```

This starts:
- **Plugin Service** on http://localhost:3001
- **Example Plugin** on http://localhost:3003
- **Plugin Host** on http://localhost:3004

### Register a Plugin

1. Open the Plugin Management UI: http://localhost:3001
2. Add the example plugin:
   - **Name**: `example-plugin`
   - **Type**: `URL`
   - **Location**: `http://localhost:3003/remoteEntry.json`
3. Click **"Add Module"**

### Test the Plugin System

1. Open the Plugin Host Demo: http://localhost:3004
2. You should see the loaded plugins and be able to interact with them

## 💻 Usage

### Using the Plugin System in Your Application

1. **Install the plugin system library:**

```bash
pnpm add plugin-system
```

2. **Load and use plugins in your application:**

```typescript
import { getPlugins } from 'plugin-system';

// Define your plugin interface
interface MyPlugin {
  name: string;
  execute(data?: any): any;
}

// Load all registered plugins
const plugins = await getPlugins<MyPlugin>(
  'http://localhost:3001/api/manifest'
);

// Use the plugins
plugins.forEach(plugin => {
  console.log(`Loaded plugin: ${plugin.name}`);
  const result = plugin.execute({ foo: 'bar' });
  console.log('Result:', result);
});
```

3. **Advanced usage with PluginLoader class:**

```typescript
import { PluginLoader } from 'plugin-system';

const loader = new PluginLoader({
  manifestUrl: 'http://localhost:3001/api/manifest'
});

// Get plugins
const plugins = await loader.getPlugins<MyPlugin>();

// Clear cache and reload
loader.clearCache();
const freshPlugins = await loader.getPlugins<MyPlugin>();

// Get raw manifest
const manifest = await loader.getManifest();
```

## 🔌 Creating Plugins

### Plugin Requirements

A plugin must:
1. Be a Native Federation module
2. Expose a `./plugin` module
3. Have a default export matching your plugin interface

### Example Plugin Implementation

**1. Create federation configuration (`src/federation.ts`):**

```typescript
import { withNativeFederation } from '@softarc/native-federation';

export default withNativeFederation({
  name: 'my-plugin',
  exposes: {
    './plugin': './src/plugin.ts',
  },
  shared: {
    // Add shared dependencies here
  },
});
```

**2. Implement your plugin (`src/plugin.ts`):**

```typescript
interface MyPlugin {
  name: string;
  version: string;
  execute(data?: any): any;
}

class MyPluginImpl implements MyPlugin {
  name = 'My Awesome Plugin';
  version = '1.0.0';

  execute(data?: any): any {
    console.log('Plugin executing with data:', data);
    return {
      success: true,
      message: 'Hello from my plugin!',
      data
    };
  }
}

export default new MyPluginImpl();
```

**3. Configure Vite (`vite.config.ts`):**

```typescript
import { defineConfig } from 'vite';
import federation from '@module-federation/vite';
import federationConfig from './src/federation';

export default defineConfig({
  plugins: [
    federation(federationConfig)
  ],
  server: {
    port: 3005 // Choose your port
  }
});
```

**4. Build and serve your plugin:**

```bash
pnpm build
pnpm start
```

**5. Register your plugin:**

Use the Management UI at http://localhost:3001 or the API:

```bash
curl -X POST http://localhost:3001/api/add-module \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-plugin",
    "url": "http://localhost:3005/remoteEntry.json"
  }'
```

## 📚 API Reference

### Plugin Service API

#### `GET /api/manifest`
Returns the Native Federation manifest with all registered plugins.

**Response:**
```json
{
  "success": true,
  "data": {
    "example-plugin": "http://localhost:3003/remoteEntry.json",
    "my-plugin": "http://localhost:3005/remoteEntry.json"
  }
}
```

#### `POST /api/add-module`
Registers a new plugin module.

**Request:**
```json
{
  "name": "my-plugin",
  "url": "http://localhost:3005/remoteEntry.json"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "my-plugin",
      "type": "url",
      "location": "http://localhost:3005/remoteEntry.json",
      "createdAt": "2025-10-29T12:00:00.000Z"
    }
  ]
}
```

#### `POST /api/remove-module`
Removes a plugin module.

**Request:**
```json
{
  "name": "my-plugin"
}
```

**Response:**
```json
{
  "success": true,
  "data": []
}
```

#### `POST /api/update-module`
Updates an existing plugin module.

**Request:**
```json
{
  "name": "my-plugin",
  "url": "http://localhost:3006/remoteEntry.json"
}
```

#### `GET /api/modules`
Returns all registered modules with metadata.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "example-plugin",
      "type": "url",
      "location": "http://localhost:3003/remoteEntry.json",
      "createdAt": "2025-10-29T12:00:00.000Z"
    }
  ]
}
```

### Plugin System Library API

#### `getPlugins<T>(manifestUrl: string): Promise<T[]>`
Main function to load all plugins.

**Parameters:**
- `manifestUrl` - URL to the plugin manifest endpoint

**Returns:**
- Promise resolving to array of loaded plugins

#### `PluginLoader` Class

**Constructor:**
```typescript
new PluginLoader(config: PluginSystemConfig)
```

**Methods:**
- `async getPlugins<T>(): Promise<T[]>` - Load all plugins
- `clearCache(): void` - Clear the plugin cache
- `async getManifest(): Promise<PluginManifest>` - Get raw manifest

## 🛠️ Development

### Running Individual Services

```bash
# Plugin service only
pnpm run:plugin-service

# Example plugin only
pnpm run:example-plugin

# Plugin host only
pnpm run:example-plugin-host
```

### Building Packages

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter plugin-service run build
pnpm --filter plugin-system run build
pnpm --filter example-plugin run build
pnpm --filter example-plugin-host run build
```

### Development Workflow

1. Make changes to source files
2. Rebuild the affected package
3. Restart the relevant service
4. Test your changes

## 🐛 Troubleshooting

### Plugin Service Won't Start

**Problem:** Port 3001 is already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Plugins Not Loading

**Checklist:**
- ✅ Plugin service is running on port 3001
- ✅ Plugin is registered in the management UI
- ✅ Plugin's `remoteEntry.json` is accessible
- ✅ Plugin exposes `./plugin` module correctly
- ✅ Check browser console for errors

### CORS Issues

The plugin service includes CORS headers by default. For production:

```typescript
// In plugin-service/src/index.ts
app.use(cors({
  origin: ['https://your-domain.com'],
  credentials: true
}));
```

### Build Errors

**Problem:** TypeScript compilation errors

**Solution:**
```bash
# Clean and rebuild
pnpm --filter <package-name> run clean
pnpm --filter <package-name> run build
```

### Module Federation Errors

**Common issues:**
- Ensure all packages use compatible versions of `@softarc/native-federation`
- Check that plugin names are unique
- Verify `remoteEntry.json` is being generated correctly

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

## 📞 Support

[Add support information here]

---

For more detailed information, see:
- [PLUGIN_SYSTEM_README.md](./PLUGIN_SYSTEM_README.md) - Detailed plugin system documentation
- [PLUGINS.md](./PLUGINS.md) - Original requirements and specifications