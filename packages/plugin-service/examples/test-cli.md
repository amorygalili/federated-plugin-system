# CLI Testing Guide

This guide shows how to test all the CLI options.

## Basic Usage

### Default Settings

```bash
plugin-service
```

Expected output:
- Port: 3001
- Data path: ./data (default)
- Base URL: http://localhost:3001
- CORS: enabled
- UI: enabled
- Health check: enabled

### Help Command

```bash
plugin-service --help
# or
plugin-service -h
```

Should display usage information and all available options.

## Port Configuration

### Long Form

```bash
plugin-service --port 4000
```

Expected:
- Port: 4000
- Base URL: http://localhost:4000 (auto-adjusted)

### Short Form

```bash
plugin-service -p 5000
```

Expected:
- Port: 5000
- Base URL: http://localhost:5000 (auto-adjusted)

## Data Path Configuration

### Long Form

```bash
plugin-service --data-path ./my-plugins
```

Expected:
- Data path: ./my-plugins

### Short Form

```bash
plugin-service -d ./custom-data
```

Expected:
- Data path: ./custom-data

## Base URL Configuration

### Long Form

```bash
plugin-service --base-url http://myserver.com:3001
```

Expected:
- Base URL: http://myserver.com:3001

### Short Form

```bash
plugin-service -b http://example.com:4000
```

Expected:
- Base URL: http://example.com:4000

## Feature Toggles

### Disable CORS

```bash
plugin-service --no-cors
```

Expected:
- CORS: disabled

### Disable UI

```bash
plugin-service --no-ui
```

Expected:
- UI: disabled
- Management UI should not be accessible

### Disable Health Check

```bash
plugin-service --no-health-check
```

Expected:
- Health check: disabled
- /health endpoint should not be available

## Combined Options

### All Options Together

```bash
plugin-service --port 4000 --data-path ./plugins --base-url http://localhost:4000 --no-cors --no-ui
```

Expected:
- Port: 4000
- Data path: ./plugins
- Base URL: http://localhost:4000
- CORS: disabled
- UI: disabled
- Health check: enabled

### Short Form Combined

```bash
plugin-service -p 4000 -d ./plugins -b http://localhost:4000
```

Expected:
- Port: 4000
- Data path: ./plugins
- Base URL: http://localhost:4000

## Testing Checklist

- [ ] Default settings work
- [ ] `--help` shows usage information
- [ ] `--port` changes the port
- [ ] `-p` (short form) changes the port
- [ ] `--data-path` changes the data directory
- [ ] `-d` (short form) changes the data directory
- [ ] `--base-url` changes the base URL
- [ ] `-b` (short form) changes the base URL
- [ ] `--no-cors` disables CORS
- [ ] `--no-ui` disables the management UI
- [ ] `--no-health-check` disables health check
- [ ] Multiple options can be combined
- [ ] Invalid options show error and help

## Verification Steps

### 1. Verify Port

```bash
plugin-service -p 4000
```

Then visit: http://localhost:4000

### 2. Verify Data Path

```bash
plugin-service -d ./test-data
```

Check that `./test-data/modules.json` is created.

### 3. Verify Base URL

```bash
plugin-service -b http://example.com:3001
```

Check the manifest endpoint returns URLs with the custom base URL.

### 4. Verify No UI

```bash
plugin-service --no-ui
```

Visit http://localhost:3001/ - should return 404 or API response, not the UI.

### 5. Verify No CORS

```bash
plugin-service --no-cors
```

Make a cross-origin request - should fail without CORS headers.

## Common Use Cases

### Development

```bash
plugin-service -p 3001 -d ./dev-plugins
```

### Production

```bash
plugin-service -p 80 -d /var/lib/plugins -b https://plugins.myapp.com --no-ui
```

### Testing

```bash
plugin-service -p 9999 -d ./test-plugins --no-cors
```

### API Only (No UI)

```bash
plugin-service --no-ui --no-health-check
```

