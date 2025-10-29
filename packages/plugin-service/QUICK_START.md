# Quick Start Guide

Get started with plugin-service in 5 minutes!

## Installation

```bash
npm install plugin-service
```

## Usage Options

### 1. Standalone Server (Fastest)

Run the plugin service as a standalone server:

```bash
npx plugin-service
```

That's it! The service is now running at `http://localhost:3001`

- Management UI: `http://localhost:3001/`
- API: `http://localhost:3001/api/manifest`

### 2. Express Router (Most Flexible)

Add to your existing Express app:

```typescript
import express from 'express';
import { createPluginServiceRouter } from 'plugin-service';

const app = express();

// Mount plugin service at /plugins
app.use('/plugins', createPluginServiceRouter());

app.listen(3000);
```

Access at:
- Management UI: `http://localhost:3000/plugins/`
- API: `http://localhost:3000/plugins/api/manifest`

### 3. Standalone App

Create a complete Express app:

```typescript
import { createPluginServiceApp } from 'plugin-service';

const app = createPluginServiceApp();
app.listen(3001);
```

## Basic Configuration

### Custom Data Path

```typescript
createPluginServiceRouter({
  dataPath: './my-plugins'
})
```

### Custom Base URL

```typescript
createPluginServiceRouter({
  baseUrl: 'http://myserver.com:3000'
})
```

### Disable UI

```typescript
createPluginServiceRouter({
  serveUI: false
})
```

## API Usage

### Add a Plugin

```bash
curl -X POST http://localhost:3001/api/add-module \
  -H "Content-Type: application/json" \
  -d '{"name": "my-plugin", "url": "http://example.com/remoteEntry.json"}'
```

### Get Manifest

```bash
curl http://localhost:3001/api/manifest
```

### Remove a Plugin

```bash
curl -X POST http://localhost:3001/api/remove-module \
  -H "Content-Type: application/json" \
  -d '{"name": "my-plugin"}'
```

## Programmatic Usage

```typescript
import { Database } from 'plugin-service';

const db = new Database();

// Add a plugin
db.addModule('my-plugin', 'http://example.com/remoteEntry.json');

// Get manifest
const manifest = db.generateManifest();
console.log(manifest);

// Remove a plugin
db.removeModule('my-plugin');
```

## CLI Options

```bash
# Custom port
plugin-service --port 4000

# Custom data path
plugin-service --data-path ./plugins

# Custom base URL
plugin-service --base-url http://localhost:4000

# All together
plugin-service -p 4000 -d ./plugins -b http://localhost:4000

# Disable features
plugin-service --no-ui --no-cors

# Show help
plugin-service --help
```

## Next Steps

- Read the [README.md](./README.md) for detailed documentation
- Check out [examples/integration-guide.md](./examples/integration-guide.md) for integration patterns
- See [examples/](./examples/) for code examples

## Common Use Cases

### Use Case 1: Development Server

```bash
# Terminal 1: Run plugin service
npx plugin-service

# Terminal 2: Run your app
npm run dev
```

### Use Case 2: Embedded in App

```typescript
import express from 'express';
import { createPluginServiceRouter } from 'plugin-service';

const app = express();

// Your app routes
app.get('/api/data', (req, res) => res.json({ data: 'hello' }));

// Plugin management
app.use('/admin/plugins', createPluginServiceRouter());

app.listen(3000);
```

### Use Case 3: Microservice

```typescript
// plugin-service.js
import { createPluginServiceApp } from 'plugin-service';

createPluginServiceApp({
  dataPath: process.env.DATA_PATH,
  baseUrl: process.env.BASE_URL,
  enableCors: true
}).listen(3001);
```

```typescript
// main-app.js
async function getPlugins() {
  const res = await fetch('http://localhost:3001/api/manifest');
  return res.json();
}
```

## Troubleshooting

### Port Already in Use

```bash
# Use a different port
PORT=4000 npx plugin-service
```

### CORS Issues

```typescript
createPluginServiceRouter({
  enableCors: true
})
```

### Module Not Found

Check that:
1. The module URL is correct
2. The module has a `remoteEntry.json` file
3. The base URL matches your server

## Support

- Check the [examples/](./examples/) directory
- Read the [integration guide](./examples/integration-guide.md)
- Review the [CHANGELOG.md](./CHANGELOG.md)

Happy plugin managing! 🚀

