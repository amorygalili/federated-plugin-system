import express, { Express, Router } from 'express';
import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Database } from './database';
import { createRoutes } from './routes';

export interface PluginServiceOptions {
  /**
   * Base path for data storage (modules.json and modules directory)
   * Defaults to './data' relative to process.cwd()
   */
  dataPath?: string;

  /**
   * Whether to enable CORS
   * Defaults to true
   */
  enableCors?: boolean;

  /**
   * Whether to serve the management UI
   * Defaults to true
   */
  serveUI?: boolean;

  /**
   * Custom base URL for local modules
   * Defaults to 'http://localhost:3001'
   */
  baseUrl?: string;

  /**
   * Whether to enable health check endpoint
   * Defaults to true
   */
  enableHealthCheck?: boolean;
}

/**
 * Creates an Express router with plugin service functionality
 * This can be mounted on any Express app
 */
export function createPluginServiceRouter(options: PluginServiceOptions = {}): Router {
  const {
    dataPath,
    enableCors = true,
    serveUI = true,
    baseUrl,
    enableHealthCheck = true
  } = options;

  const router = Router();

  // Initialize database with custom data path if provided
  const db = new Database(dataPath, baseUrl);

  // Middleware
  if (enableCors) {
    router.use(cors());
  }
  router.use(express.json());
  router.use(express.urlencoded({ extended: true }));

  // API routes
  router.use(createRoutes(db));

  // Static file serving for local modules
  // Serve module files under /modules/{name} path
  router.use('/modules/:name', (req, res, next) => {
    const moduleName = req.params.name;
    const modulePath = path.join(db.getModulesDirectory(), moduleName);

    // Check if the module directory exists
    if (fs.existsSync(modulePath)) {
      express.static(modulePath)(req, res, next);
    } else {
      res.status(404).json({ error: `Module '${moduleName}' not found` });
    }
  });

  if (serveUI) {
    // Serve the management UI
    router.use(express.static(path.join(__dirname, '../public')));

    // Serve index.html for the management UI
    router.get('/', (_req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
  }

  // Health check endpoint
  if (enableHealthCheck) {
    router.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  return router;
}

/**
 * Creates a standalone Express app with plugin service
 * Useful for running as a standalone server
 */
export function createPluginServiceApp(options: PluginServiceOptions = {}): Express {
  const app = express();

  const router = createPluginServiceRouter(options);
  app.use(router);

  // Error handling middleware
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  });

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not found'
    });
  });

  return app;
}

// Export Database and types for external use
export { Database } from './database';
export * from './types';
