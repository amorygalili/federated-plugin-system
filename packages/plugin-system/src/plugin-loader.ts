import { initFederation, loadRemoteModule } from "@softarc/native-federation";
import { 
  PluginManifest, 
  PluginLoadOptions, 
  PluginModule, 
  PluginLoadResult,
  PluginSystemConfig 
} from "./types";

class PluginLoader {
  private manifestCache: PluginManifest | null = null;
  private pluginCache: Map<string, any> = new Map();
  private config: PluginSystemConfig;

  constructor(config: PluginSystemConfig) {
    this.config = {
      pluginModuleName: "./plugin",
      timeout: 10000,
      retries: 3,
      ...config
    };
  }

  /**
   * Fetches the plugin manifest from the service
   */
  private async fetchManifest(): Promise<PluginManifest> {
    if (this.manifestCache) {
      return this.manifestCache;
    }

    const response = await fetch(this.config.manifestUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(`Manifest API error: ${result.error}`);
    }

    this.manifestCache = result.data;
    return result.data;
  }

  /**
   * Loads a single plugin module
   */
  private async loadPluginModule<T>(remoteName: string): Promise<T> {
    const cacheKey = `${remoteName}:${this.config.pluginModuleName}`;
    
    if (this.pluginCache.has(cacheKey)) {
      return this.pluginCache.get(cacheKey);
    }

    try {
      const module: PluginModule<T> = await loadRemoteModule({
        remoteName,
        exposedModule: this.config.pluginModuleName!,
      });

      const plugin = module.default;
      this.pluginCache.set(cacheKey, plugin);
      return plugin;
    } catch (error) {
      console.error(`Failed to load plugin module ${remoteName}:`, error);
      throw error;
    }
  }

  /**
   * Loads plugins with retry logic
   */
  private async loadPluginWithRetry<T>(remoteName: string, retries: number = this.config.retries!): Promise<PluginLoadResult<T>> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const plugin = await this.loadPluginModule<T>(remoteName);
        return {
          name: remoteName,
          plugin
        };
      } catch (error) {
        if (attempt === retries) {
          return {
            name: remoteName,
            plugin: null as any,
            error: error instanceof Error ? error : new Error(String(error))
          };
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }

    // This should never be reached, but TypeScript requires it
    return {
      name: remoteName,
      plugin: null as any,
      error: new Error('Max retries exceeded')
    };
  }

  /**
   * Main function to get all plugins
   * Returns a list of plugins. Internally this calls the /api/manifest endpoint 
   * and passes the result to initFederation. It then loops through the list of 
   * modules in the manifest and calls loadRemoteModule(remoteName, "./plugin"). 
   * Every plugin is expected to have a plugin module which has a default export of type T.
   */
  async getPlugins<T>(): Promise<T[]> {
    try {
      // Step 1: Fetch the manifest
      const manifest = await this.fetchManifest();
      
      // Step 2: Initialize federation with the manifest
      await initFederation(manifest);
      
      // Step 3: Load all plugin modules
      const pluginNames = Object.keys(manifest);
      const loadPromises = pluginNames.map(name => this.loadPluginWithRetry<T>(name));
      
      // Step 4: Wait for all plugins to load (with timeout)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Plugin loading timeout')), this.config.timeout);
      });
      
      const results = await Promise.race([
        Promise.all(loadPromises),
        timeoutPromise
      ]) as PluginLoadResult<T>[];
      
      // Step 5: Filter out failed plugins and return successful ones
      const successfulPlugins: T[] = [];
      const failedPlugins: string[] = [];
      
      results.forEach(result => {
        if (result.error) {
          failedPlugins.push(result.name);
          console.error(`Failed to load plugin ${result.name}:`, result.error);
        } else {
          successfulPlugins.push(result.plugin);
        }
      });
      
      if (failedPlugins.length > 0) {
        console.warn(`Failed to load ${failedPlugins.length} plugin(s): ${failedPlugins.join(', ')}`);
      }
      
      console.log(`Successfully loaded ${successfulPlugins.length} plugin(s)`);
      return successfulPlugins;
      
    } catch (error) {
      console.error('Failed to load plugins:', error);
      throw error;
    }
  }

  /**
   * Clears the manifest cache to force a refresh on next load
   */
  clearCache(): void {
    this.manifestCache = null;
    this.pluginCache.clear();
  }

  /**
   * Gets the current manifest without loading plugins
   */
  async getManifest(): Promise<PluginManifest> {
    return this.fetchManifest();
  }
}

// Factory function to create a plugin loader
export function createPluginLoader(config: PluginSystemConfig): PluginLoader {
  return new PluginLoader(config);
}

// Default export for convenience
export default PluginLoader;

// Export the main function for direct use
export async function getPlugins<T>(manifestUrl: string, options: PluginLoadOptions = {}): Promise<T[]> {
  const loader = new PluginLoader({
    manifestUrl,
    ...options
  });
  
  return loader.getPlugins<T>();
}
