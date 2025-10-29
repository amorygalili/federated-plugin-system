// Example plugin interface
export interface ExamplePlugin {
  name: string;
  version: string;
  description: string;
  initialize(): void;
  execute(data?: any): any;
  cleanup?(): void;
}

// Example plugin implementation
class MyExamplePlugin implements ExamplePlugin {
  name = "Example Plugin";
  version = "1.0.0";
  description = "A simple example plugin for demonstration";

  initialize(): void {
    console.log(`${this.name} v${this.version} initialized`);
  }

  execute(data?: any): any {
    console.log(`${this.name} executing with data:`, data);
    
    return {
      message: `Hello from ${this.name}!`,
      timestamp: new Date().toISOString(),
      inputData: data,
      pluginInfo: {
        name: this.name,
        version: this.version,
        description: this.description
      }
    };
  }

  cleanup(): void {
    console.log(`${this.name} cleaning up`);
  }
}

// Default export - this is what the plugin system will load
const plugin = new MyExamplePlugin();
export default plugin;
