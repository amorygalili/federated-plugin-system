import { Router, Request, Response } from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import { Database } from './database';
import { AddModuleRequest, UpdateModuleRequest, RemoveModuleRequest, ApiResponse } from './types';

export function createRoutes(db: Database): Router {
  const router = Router();

  // GET /api/manifest - returns the manifest generated from the list of modules
  router.get('/api/manifest', (req: Request, res: Response) => {
    try {
      const manifest = db.generateManifest();
      const response: ApiResponse = {
        success: true,
        data: manifest
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  });

  // POST /api/add-module - Adds a module to the manifest
  router.post('/api/add-module', async (req: Request, res: Response) => {
    try {
      const { name, url, path: modulePath }: AddModuleRequest = req.body;

      if (!name) {
        const response: ApiResponse = {
          success: false,
          error: 'Module name is required'
        };
        return res.status(400).json(response);
      }

      // If it's a local path, validate that remoteEntry.json exists
      if (modulePath && !url) {
        const remoteEntryPath = path.join(modulePath, 'remoteEntry.json');
        if (!await fs.pathExists(remoteEntryPath)) {
          const response: ApiResponse = {
            success: false,
            error: `remoteEntry.json not found in path: ${modulePath}`
          };
          return res.status(400).json(response);
        }

        // Copy the module files to our modules directory
        const targetDir = path.join(db.getModulesDirectory(), name);
        await fs.ensureDir(targetDir);
        await fs.copy(modulePath, targetDir);
      }

      const module = db.addModule(name, url, modulePath);
      const modules = db.getAllModules();

      const response: ApiResponse = {
        success: true,
        data: modules
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  });

  // POST /api/remove-module - Removes a module from the manifest
  router.post('/api/remove-module', async (req: Request, res: Response) => {
    try {
      const { name }: RemoveModuleRequest = req.body;

      if (!name) {
        const response: ApiResponse = {
          success: false,
          error: 'Module name is required'
        };
        return res.status(400).json(response);
      }

      const module = db.getModuleByName(name);
      if (module && module.type === 'local') {
        // Remove the module files from our modules directory
        const targetDir = path.join(db.getModulesDirectory(), name);
        if (await fs.pathExists(targetDir)) {
          await fs.remove(targetDir);
        }
      }

      const removed = db.removeModule(name);
      if (!removed) {
        const response: ApiResponse = {
          success: false,
          error: `Module with name '${name}' not found`
        };
        return res.status(404).json(response);
      }

      const modules = db.getAllModules();
      const response: ApiResponse = {
        success: true,
        data: modules
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  });

  // POST /api/update-module - Updates a module in the manifest
  router.post('/api/update-module', async (req: Request, res: Response) => {
    try {
      const { name, url, path: modulePath }: UpdateModuleRequest = req.body;

      if (!name) {
        const response: ApiResponse = {
          success: false,
          error: 'Module name is required'
        };
        return res.status(400).json(response);
      }

      // If it's a local path, validate that remoteEntry.json exists
      if (modulePath && !url) {
        const remoteEntryPath = path.join(modulePath, 'remoteEntry.json');
        if (!await fs.pathExists(remoteEntryPath)) {
          const response: ApiResponse = {
            success: false,
            error: `remoteEntry.json not found in path: ${modulePath}`
          };
          return res.status(400).json(response);
        }

        // Update the module files in our modules directory
        const targetDir = path.join(db.getModulesDirectory(), name);
        await fs.ensureDir(targetDir);
        await fs.copy(modulePath, targetDir);
      }

      const module = db.updateModule(name, url, modulePath);
      const modules = db.getAllModules();

      const response: ApiResponse = {
        success: true,
        data: modules
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(400).json(response);
    }
  });

  // GET /api/modules - Get all modules (for management UI)
  router.get('/api/modules', (req: Request, res: Response) => {
    try {
      const modules = db.getAllModules();
      const response: ApiResponse = {
        success: true,
        data: modules
      };
      res.json(response);
    } catch (error) {
      const response: ApiResponse = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  });

  return router;
}
