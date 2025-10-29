export interface PluginManifest {
  [key: string]: string;
}

export interface PluginLoadOptions {
  manifestUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface PluginModule<T = any> {
  default: T;
}

export interface PluginLoadResult<T = any> {
  name: string;
  plugin: T;
  error?: Error;
}

export interface PluginSystemConfig {
  manifestUrl: string;
  pluginModuleName?: string;
  timeout?: number;
  retries?: number;
}
