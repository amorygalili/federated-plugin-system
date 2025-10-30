# Federated Plugin Service

Backend service for managing federated plugins. Can run as a standalone server or integrate into existing Express apps.

## Installation

```bash
npm install federated-plugin-service
```

## Quick Start

### Standalone Server

```bash
npx federated-plugin-service

# With options
federated-plugin-service --port 4000 --data-path ./plugins
```

### Express Integration

```typescript
import express from 'express';
import { createPluginServiceRouter } from 'federated-plugin-service';

const app = express();

app.use('/plugins', createPluginServiceRouter({
  dataPath: './plugins',
  serveUI: true
}));

app.listen(3000);
```

## API

- `GET /api/manifest` - Get plugin manifest
- `POST /api/add-module` - Add a plugin
- `POST /api/remove-module` - Remove a plugin
- `GET /api/modules` - List all plugins
- `GET /` - Management UI

## Programmatic Usage

```typescript
import { Database } from 'federated-plugin-service';

const db = new Database('./data', 'http://localhost:3000');

db.addModule('my-plugin', 'http://example.com/remoteEntry.json');
const manifest = db.generateManifest();
db.removeModule('my-plugin');
```

## Related

- [federated-plugin-system](https://www.npmjs.com/package/federated-plugin-system) - Frontend library for loading plugins

## License

MIT

