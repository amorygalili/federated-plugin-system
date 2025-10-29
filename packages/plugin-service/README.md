# Plugin Service

A flexible plugin management service for native federation that can be used as a standalone server or integrated into existing Express applications.

## Features

- 🔌 Manage federated modules dynamically
- 🌐 Support for both URL-based and local file-based modules
- 📦 Express middleware/router for easy integration
- 🖥️ Built-in management UI
- 🔧 Configurable data storage location
- 🚀 Can run as standalone server or embedded in your app

## Installation

```bash
npm install plugin-service
```

## Usage

### As a Standalone Server

Run the service as a standalone server using the CLI:

```bash
# Using npx
npx plugin-service

# Or if installed globally
plugin-service

# With custom port
plugin-service --port 4000

# With custom data path
plugin-service --data-path /path/to/data

# With custom base URL
plugin-service --port 4000 --base-url http://myserver.com:4000

# Disable UI and CORS
plugin-service --no-ui --no-cors

# Short form options
plugin-service -p 4000 -d ./my-plugins -b http://localhost:4000

# Show help
plugin-service --help
```

#### CLI Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--port <number>` | `-p` | Port to listen on | `3001` |
| `--data-path <path>` | `-d` | Path to store plugin data | `./data` |
| `--base-url <url>` | `-b` | Base URL for local modules | `http://localhost:<port>` |
| `--no-cors` | | Disable CORS | CORS enabled |
| `--no-ui` | | Disable management UI | UI enabled |
| `--no-health-check` | | Disable health check endpoint | Health check enabled |
| `--help` | `-h` | Show help message | |

### As an Express Middleware/Router

Integrate the plugin service into your existing Express application:

```typescript
import express from 'express';
import { createPluginServiceRouter } from 'plugin-service';

const app = express();

// Mount the plugin service at a specific path
const pluginRouter = createPluginServiceRouter({
  dataPath: './my-plugins-data',
  baseUrl: 'http://localhost:3000',
  enableCors: true,
  serveUI: true,
  enableHealthCheck: true
});

app.use('/plugins', pluginRouter);

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('Plugin service available at http://localhost:3000/plugins');
});
```

### As a Standalone Express App

Create a complete Express app with the plugin service:

```typescript
import { createPluginServiceApp } from 'plugin-service';

const app = createPluginServiceApp({
  dataPath: './data',
  baseUrl: 'http://localhost:3001',
  enableCors: true,
  serveUI: true,
  enableHealthCheck: true
});

app.listen(3001, () => {
  console.log('Plugin service running on port 3001');
});
```

## Configuration Options

### `PluginServiceOptions`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dataPath` | `string` | `'./data'` | Base path for data storage (modules.json and modules directory) |
| `enableCors` | `boolean` | `true` | Whether to enable CORS |
| `serveUI` | `boolean` | `true` | Whether to serve the management UI |
| `baseUrl` | `string` | `'http://localhost:3001'` | Custom base URL for local modules |
| `enableHealthCheck` | `boolean` | `true` | Whether to enable health check endpoint |

## API Endpoints

When mounted, the plugin service exposes the following endpoints:

- `GET /api/manifest` - Get the module manifest
- `POST /api/add-module` - Add a new module
- `POST /api/remove-module` - Remove a module
- `POST /api/update-module` - Update a module
- `GET /api/modules` - Get all modules
- `GET /modules/:name/*` - Serve local module files
- `GET /health` - Health check endpoint (if enabled)
- `GET /` - Management UI (if enabled)

## Advanced Usage

### Using the Database Directly

You can also use the Database class directly for programmatic access:

```typescript
import { Database } from 'plugin-service';

const db = new Database('./my-data', 'http://localhost:3000');

// Add a module
db.addModule('my-plugin', 'http://example.com/remoteEntry.json');

// Get all modules
const modules = db.getAllModules();

// Generate manifest
const manifest = db.generateManifest();

// Remove a module
db.removeModule('my-plugin');
```

## Examples

### Integration with Existing Server

```typescript
import express from 'express';
import { createPluginServiceRouter } from 'plugin-service';

const app = express();

// Your existing routes
app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

// Add plugin service
app.use('/plugin-manager', createPluginServiceRouter({
  dataPath: './plugins',
  serveUI: true
}));

app.listen(3000);
```

### Custom Base Path

```typescript
import { createPluginServiceRouter } from 'plugin-service';

const router = createPluginServiceRouter({
  dataPath: '/var/lib/my-app/plugins',
  baseUrl: 'https://myapp.com',
  enableCors: false, // Disable CORS if not needed
  serveUI: false // Disable UI if you have your own
});
```

## CLI Options Reference

See the [CLI Options](#cli-options) section above for all available command-line arguments.

## License

MIT

