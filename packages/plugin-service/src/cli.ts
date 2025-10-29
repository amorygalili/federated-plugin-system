#!/usr/bin/env node
import { createPluginServiceApp } from './index';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options: {
    port?: number;
    dataPath?: string;
    baseUrl?: string;
    noCors?: boolean;
    noUI?: boolean;
    noHealthCheck?: boolean;
    help?: boolean;
  } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '-p':
      case '--port':
        options.port = parseInt(args[++i], 10);
        break;
      case '-d':
      case '--data-path':
        options.dataPath = args[++i];
        break;
      case '-b':
      case '--base-url':
        options.baseUrl = args[++i];
        break;
      case '--no-cors':
        options.noCors = true;
        break;
      case '--no-ui':
        options.noUI = true;
        break;
      case '--no-health-check':
        options.noHealthCheck = true;
        break;
      case '-h':
      case '--help':
        options.help = true;
        break;
      default:
        console.error(`Unknown option: ${arg}`);
        options.help = true;
        break;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
Plugin Service CLI

Usage: plugin-service [options]

Options:
  -p, --port <number>        Port to listen on (default: 3001)
  -d, --data-path <path>     Path to store plugin data (default: ./data)
  -b, --base-url <url>       Base URL for local modules (default: http://localhost:<port>)
  --no-cors                  Disable CORS
  --no-ui                    Disable management UI
  --no-health-check          Disable health check endpoint
  -h, --help                 Show this help message

Examples:
  plugin-service
  plugin-service --port 4000
  plugin-service --port 4000 --data-path ./my-plugins
  plugin-service --port 4000 --base-url http://myserver.com:4000
  plugin-service --no-ui --no-cors
`);
}

const options = parseArgs();

if (options.help) {
  showHelp();
  process.exit(0);
}

const PORT = options.port || 3001;
const DATA_PATH = options.dataPath;
const BASE_URL = options.baseUrl || `http://localhost:${PORT}`;

const app = createPluginServiceApp({
  dataPath: DATA_PATH,
  baseUrl: BASE_URL,
  enableCors: !options.noCors,
  serveUI: !options.noUI,
  enableHealthCheck: !options.noHealthCheck
});

app.listen(PORT, () => {
  console.log(`Plugin service running on port ${PORT}`);
  console.log(`Management UI available at http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  /api/manifest`);
  console.log(`  POST /api/add-module`);
  console.log(`  POST /api/remove-module`);
  console.log(`  POST /api/update-module`);
  console.log(`  GET  /api/modules`);
  console.log(`\nConfiguration:`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Data path: ${DATA_PATH || './data (default)'}`);
  console.log(`  Base URL: ${BASE_URL}`);
  console.log(`  CORS: ${!options.noCors ? 'enabled' : 'disabled'}`);
  console.log(`  UI: ${!options.noUI ? 'enabled' : 'disabled'}`);
  console.log(`  Health check: ${!options.noHealthCheck ? 'enabled' : 'disabled'}`);
});

