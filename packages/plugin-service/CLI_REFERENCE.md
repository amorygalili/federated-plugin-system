# CLI Reference

Complete reference for the plugin-service command-line interface.

## Synopsis

```bash
plugin-service [options]
```

## Description

The plugin-service CLI starts a standalone server for managing federated plugins. It provides a REST API and optional management UI for adding, removing, and updating plugins dynamically.

## Options

### `-p, --port <number>`

Port number to listen on.

- **Type:** Number
- **Default:** `3001`
- **Example:** `plugin-service --port 4000`

### `-d, --data-path <path>`

Path to store plugin data (modules.json and module files).

- **Type:** String (file path)
- **Default:** `./data`
- **Example:** `plugin-service --data-path /var/lib/plugins`

### `-b, --base-url <url>`

Base URL for serving local modules. This URL is used in the manifest for local modules.

- **Type:** String (URL)
- **Default:** `http://localhost:<port>`
- **Example:** `plugin-service --base-url https://plugins.myapp.com`

### `--no-cors`

Disable CORS (Cross-Origin Resource Sharing) middleware.

- **Type:** Boolean flag
- **Default:** CORS is enabled
- **Example:** `plugin-service --no-cors`

### `--no-ui`

Disable the management UI. Only the API endpoints will be available.

- **Type:** Boolean flag
- **Default:** UI is enabled
- **Example:** `plugin-service --no-ui`

### `--no-health-check`

Disable the health check endpoint (`/health`).

- **Type:** Boolean flag
- **Default:** Health check is enabled
- **Example:** `plugin-service --no-health-check`

### `-h, --help`

Show help message and exit.

- **Type:** Boolean flag
- **Example:** `plugin-service --help`

## Examples

### Basic Usage

Start the server with default settings:

```bash
plugin-service
```

This starts the server on port 3001 with all features enabled.

### Custom Port

Run on a different port:

```bash
plugin-service --port 8080
# or
plugin-service -p 8080
```

### Custom Data Directory

Store plugin data in a custom location:

```bash
plugin-service --data-path /var/lib/my-app/plugins
# or
plugin-service -d ./my-plugins
```

### Custom Base URL

Use a custom base URL for local modules:

```bash
plugin-service --base-url https://cdn.myapp.com
# or
plugin-service -b http://192.168.1.100:3001
```

### API-Only Mode

Run without the management UI:

```bash
plugin-service --no-ui
```

### Minimal Configuration

Run with minimal features (no CORS, no UI, no health check):

```bash
plugin-service --no-cors --no-ui --no-health-check
```

### Production Setup

Typical production configuration:

```bash
plugin-service \
  --port 80 \
  --data-path /var/lib/plugins \
  --base-url https://plugins.myapp.com \
  --no-ui
```

### Development Setup

Typical development configuration:

```bash
plugin-service -p 3001 -d ./dev-plugins
```

### Combined Options

Use multiple options together:

```bash
plugin-service -p 4000 -d ./plugins -b http://localhost:4000 --no-cors
```

## Exit Codes

- `0` - Success
- `1` - Error (invalid arguments, port in use, etc.)

## Environment

The CLI does not use environment variables. All configuration is done via command-line arguments.

## Files

### Data Directory Structure

When running, the CLI creates the following structure in the data directory:

```
<data-path>/
├── modules.json          # Plugin registry
└── modules/              # Local module files
    ├── plugin1/
    │   └── remoteEntry.json
    └── plugin2/
        └── remoteEntry.json
```

### modules.json Format

```json
{
  "modules": [
    {
      "id": "uuid",
      "name": "plugin-name",
      "url": "http://example.com/remoteEntry.json",
      "type": "url",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## API Endpoints

When running, the following endpoints are available:

### Management API

- `GET /api/manifest` - Get the plugin manifest
- `GET /api/modules` - Get all registered modules
- `POST /api/add-module` - Add a new module
- `POST /api/update-module` - Update an existing module
- `POST /api/remove-module` - Remove a module

### Static Files

- `GET /modules/:name/*` - Serve local module files
- `GET /` - Management UI (if enabled)

### Health Check

- `GET /health` - Health check endpoint (if enabled)

## Troubleshooting

### Port Already in Use

If you get an error that the port is already in use:

```bash
# Use a different port
plugin-service --port 4000
```

### Permission Denied

If you get a permission error when writing to the data directory:

```bash
# Use a directory you have write access to
plugin-service --data-path ./my-plugins
```

### Cannot Access UI

If the UI is not accessible:

1. Check that `--no-ui` is not set
2. Verify the server is running
3. Check the correct port is being used

### CORS Errors

If you're getting CORS errors from your frontend:

1. Make sure `--no-cors` is not set
2. Or configure CORS in your reverse proxy/load balancer

## See Also

- [README.md](./README.md) - Package overview
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [examples/integration-guide.md](./examples/integration-guide.md) - Integration patterns

## Version

Current version: 1.0.1

## License

MIT

