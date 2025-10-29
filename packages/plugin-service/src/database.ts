import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ModuleEntry, ModuleManifest } from './types';

const DB_FILE = path.join(process.cwd(), 'data', 'modules.json');
const MODULES_DIR = path.join(process.cwd(), 'data', 'modules');

export class Database {
  private modules: ModuleEntry[] = [];

  constructor() {
    this.ensureDirectories();
    this.loadModules();
  }

  private ensureDirectories(): void {
    fs.ensureDirSync(path.dirname(DB_FILE));
    fs.ensureDirSync(MODULES_DIR);
  }

  private loadModules(): void {
    try {
      if (fs.existsSync(DB_FILE)) {
        const data = fs.readJsonSync(DB_FILE);
        this.modules = data.modules || [];
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      this.modules = [];
    }
  }

  private saveModules(): void {
    try {
      fs.writeJsonSync(DB_FILE, { modules: this.modules }, { spaces: 2 });
    } catch (error) {
      console.error('Error saving modules:', error);
      throw new Error('Failed to save modules');
    }
  }

  getAllModules(): ModuleEntry[] {
    return [...this.modules];
  }

  getModuleByName(name: string): ModuleEntry | undefined {
    return this.modules.find(module => module.name === name);
  }

  addModule(name: string, url?: string, path?: string): ModuleEntry {
    if (this.getModuleByName(name)) {
      throw new Error(`Module with name '${name}' already exists`);
    }

    if (!url && !path) {
      throw new Error('Either url or path must be provided');
    }

    const module: ModuleEntry = {
      id: uuidv4(),
      name,
      url,
      path,
      type: url ? 'url' : 'local',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // For local modules, copy files to the correct directory structure
    if (module.type === 'local' && path) {
      this.setupLocalModule(name, path);
    }

    this.modules.push(module);
    this.saveModules();
    return module;
  }

  updateModule(name: string, url?: string, path?: string): ModuleEntry {
    const moduleIndex = this.modules.findIndex(module => module.name === name);
    if (moduleIndex === -1) {
      throw new Error(`Module with name '${name}' not found`);
    }

    if (!url && !path) {
      throw new Error('Either url or path must be provided');
    }

    const module = this.modules[moduleIndex];
    const oldType = module.type;

    // Clean up old local module if switching types or updating local path
    if (oldType === 'local' && (url || (path && path !== module.path))) {
      this.cleanupLocalModule(name);
    }

    module.url = url;
    module.path = path;
    module.type = url ? 'url' : 'local';
    module.updatedAt = new Date();

    // Set up new local module if needed
    if (module.type === 'local' && path) {
      this.setupLocalModule(name, path);
    }

    this.saveModules();
    return module;
  }

  removeModule(name: string): boolean {
    const moduleIndex = this.modules.findIndex(module => module.name === name);
    if (moduleIndex === -1) {
      return false;
    }

    const module = this.modules[moduleIndex];

    // Clean up local module files
    if (module.type === 'local') {
      this.cleanupLocalModule(name);
    }

    this.modules.splice(moduleIndex, 1);
    this.saveModules();
    return true;
  }

  generateManifest(): ModuleManifest {
    const manifest: ModuleManifest = {};
    
    for (const module of this.modules) {
      if (module.type === 'url' && module.url) {
        manifest[module.name] = module.url;
      } else if (module.type === 'local' && module.path) {
        // For local modules, serve them under /modules/{name}/remoteEntry.json
        manifest[module.name] = `http://localhost:3001/modules/${module.name}/remoteEntry.json`;
      }
    }

    return manifest;
  }

  getModulesDirectory(): string {
    return MODULES_DIR;
  }

  private setupLocalModule(name: string, sourcePath: string): void {
    const targetDir = path.join(MODULES_DIR, name);

    try {
      // Ensure the target directory exists
      fs.ensureDirSync(targetDir);

      // Check if source path exists
      if (!fs.existsSync(sourcePath)) {
        throw new Error(`Source path '${sourcePath}' does not exist`);
      }

      const sourceStats = fs.statSync(sourcePath);

      if (sourceStats.isDirectory()) {
        // Copy entire directory
        fs.copySync(sourcePath, targetDir, { overwrite: true });
      } else {
        // Copy single file
        const fileName = path.basename(sourcePath);
        const targetFile = path.join(targetDir, fileName);
        fs.copySync(sourcePath, targetFile, { overwrite: true });
      }

      console.log(`Local module '${name}' set up successfully at ${targetDir}`);
    } catch (error) {
      console.error(`Error setting up local module '${name}':`, error);
      throw new Error(`Failed to set up local module: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private cleanupLocalModule(name: string): void {
    const targetDir = path.join(MODULES_DIR, name);

    try {
      if (fs.existsSync(targetDir)) {
        fs.removeSync(targetDir);
        console.log(`Local module '${name}' cleaned up from ${targetDir}`);
      }
    } catch (error) {
      console.error(`Error cleaning up local module '${name}':`, error);
    }
  }
}
