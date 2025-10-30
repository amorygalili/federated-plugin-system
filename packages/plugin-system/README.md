# Federated Plugin System

A lightweight frontend library for dynamically loading plugins using native federation.

## Installation

```bash
npm install federated-plugin-system
```

## Quick Start

```typescript
import { getPlugins } from 'federated-plugin-system';

interface MyPlugin {
  name: string;
  execute(data?: any): any;
}

const plugins = await getPlugins<MyPlugin>('http://localhost:3001/api/manifest');

plugins.forEach(plugin => {
  plugin.execute();
});
```

## API

### `getPlugins<T>(manifestUrl, options?): Promise<T[]>`

Load all plugins from a manifest URL.

```typescript
const plugins = await getPlugins<MyPlugin>(
  'http://localhost:3001/api/manifest',
  { timeout: 10000, retries: 3 }
);
```

### `PluginLoader`

For advanced usage with caching and retry control.

```typescript
const loader = new PluginLoader({
  manifestUrl: 'http://localhost:3001/api/manifest',
  timeout: 5000,
  retries: 3
});

const plugins = await loader.getPlugins<MyPlugin>();
loader.clearCache();
```

## Creating a Plugin

Plugins must expose a `./plugin` module with a default export:

```typescript
// src/plugin.ts
interface MyPlugin {
  name: string;
  execute(data?: any): any;
}

class MyPluginImpl implements MyPlugin {
  name = 'My Plugin';

  execute(data?: any): any {
    return { success: true, data };
  }
}

export default new MyPluginImpl();
```

Configure native federation to expose the plugin:

```typescript
// vite.config.ts
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'my-plugin',
      exposes: {
        './plugin': './src/plugin.ts',
      },
    }),
  ],
});
```

## Related

- [federated-plugin-service](https://www.npmjs.com/package/federated-plugin-service) - Backend service for managing plugins

## License

MIT

