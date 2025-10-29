# Changelog

## Version 1.0.1 - CLI Improvements

### Changed

- **CLI now uses command-line arguments instead of environment variables**
  - Use `--port` or `-p` instead of `PORT` env var
  - Use `--data-path` or `-d` instead of `DATA_PATH` env var
  - Use `--base-url` or `-b` instead of `BASE_URL` env var
  - Added `--no-cors`, `--no-ui`, `--no-health-check` flags
  - Added `--help` or `-h` to show usage information

### Examples

```bash
# Old way (no longer supported)
PORT=4000 DATA_PATH=./plugins plugin-service

# New way
plugin-service --port 4000 --data-path ./plugins

# Short form
plugin-service -p 4000 -d ./plugins
```

## Version 1.0.0 - Package Conversion

### Major Changes

- **Converted to Reusable Package**: The plugin-service is now a fully reusable npm package that can be integrated into other Node.js applications
- **Express Plugin/Middleware**: Added `createPluginServiceRouter()` function to create an Express router that can be mounted on any Express app
- **Standalone App Factory**: Added `createPluginServiceApp()` function to create a complete Express application
- **CLI Support**: Added CLI entry point for running as a standalone server
- **Configurable Options**: All aspects of the service are now configurable via `PluginServiceOptions`

### New Features

#### 1. Express Router Export
```typescript
import { createPluginServiceRouter } from 'plugin-service';

const router = createPluginServiceRouter({
  dataPath: './my-data',
  baseUrl: 'http://localhost:3000',
  enableCors: true,
  serveUI: true
});

app.use('/plugins', router);
```

#### 2. Standalone App Factory
```typescript
import { createPluginServiceApp } from 'plugin-service';

const app = createPluginServiceApp({
  dataPath: './data',
  baseUrl: 'http://localhost:3001'
});

app.listen(3001);
```

#### 3. CLI Tool
```bash
# Run as standalone server
npx plugin-service

# With environment variables
PORT=4000 DATA_PATH=./plugins plugin-service
```

#### 4. Configurable Database
- Database class now accepts custom data path and base URL
- Supports multiple instances with different configurations
- Can be used programmatically without Express

### Configuration Options

New `PluginServiceOptions` interface:
- `dataPath`: Custom data storage location
- `enableCors`: Toggle CORS support
- `serveUI`: Toggle management UI
- `baseUrl`: Custom base URL for local modules
- `enableHealthCheck`: Toggle health check endpoint

### Exports

The package now exports:
- `createPluginServiceRouter`: Create Express router
- `createPluginServiceApp`: Create Express app
- `Database`: Direct database access
- `PluginServiceOptions`: TypeScript interface
- All types from `types.ts`

### Package Configuration

- **Main Entry**: `dist/index.js`
- **Type Definitions**: `dist/index.d.ts`
- **CLI Binary**: `dist/cli.js`
- **Files Included**: `dist/`, `public/`

### Documentation

Added comprehensive documentation:
- `README.md`: Package overview and usage
- `examples/integration-guide.md`: Detailed integration patterns
- `examples/use-in-plugin-host.md`: Frontend integration guide
- Example files for common use cases

### Examples

Added example files:
- `integrate-with-express.ts`: Mount on existing Express app
- `standalone-app.ts`: Create standalone app
- `programmatic-usage.ts`: Use Database class directly
- `test-integration.ts`: Integration tests

### Breaking Changes

- The main `index.ts` no longer starts a server automatically
- Use `cli.ts` or `npm start` to run as standalone server
- Database constructor signature changed to accept optional parameters

### Migration Guide

**Before (v0.x):**
```typescript
// index.ts automatically started server
import './index';
```

**After (v1.0):**
```typescript
// Option 1: Use CLI
// npm start or npx plugin-service

// Option 2: Use as library
import { createPluginServiceApp } from 'plugin-service';
const app = createPluginServiceApp();
app.listen(3001);

// Option 3: Mount on existing app
import { createPluginServiceRouter } from 'plugin-service';
app.use('/plugins', createPluginServiceRouter());
```

### Testing

- All integration tests pass
- Verified Express router mounting
- Verified standalone app creation
- Verified Database class functionality

### Future Enhancements

Potential future additions:
- Plugin versioning support
- Plugin dependency management
- Plugin health monitoring
- Webhook notifications for plugin changes
- Multi-tenant support
- Plugin marketplace integration

