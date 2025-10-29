import { getPlugins } from "plugin-system";

interface ExamplePlugin {
  name: string;
  version: string;
  description: string;
  initialize(): void;
  execute(data?: any): any;
  cleanup?(): void;
}

async function main() {
  console.log("Plugin Host starting...");

  try {
    console.log("Step 1: Fetching plugins...");

    // Get all plugins from the plugin service
    const plugins: ExamplePlugin[] = await getPlugins<ExamplePlugin>(
      "http://localhost:3001/api/manifest"
    );

    console.log(`✅ Step 1 complete: Loaded ${plugins.length} plugins:`, plugins);

    if (plugins.length === 0) {
      console.warn("⚠️ No plugins found. Make sure plugins are registered in the management UI.");
      displayError(new Error("No plugins found. Please add plugins via the management UI at http://localhost:3001"));
      return;
    }

    console.log("Step 2: Initializing and executing plugins...");

    // Initialize and execute each plugin
    plugins.forEach((plugin, index) => {
      console.log(`\n--- Plugin ${index + 1}: ${plugin.name} ---`);

      // Initialize the plugin
      plugin.initialize();

      // Execute the plugin with some test data
      const result = plugin.execute({
        message: "Hello from plugin host!",
        timestamp: new Date().toISOString(),
        pluginIndex: index
      });

      console.log("Plugin execution result:", result);
    });

    console.log("✅ Step 2 complete: All plugins initialized and tested");
    console.log("Step 3: Displaying results in UI...");

    // Display results in the UI
    displayResults(plugins);

    console.log("✅ Plugin Host fully loaded and operational!");

  } catch (error) {
    console.error("Failed to load plugins:", error);
    displayError(error);
  }
}

function displayResults(plugins: ExamplePlugin[]) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1>Plugin Host Demo</h1>
      <p>Successfully loaded ${plugins.length} plugin(s)</p>
      
      <div style="margin-top: 30px;">
        <h2>Loaded Plugins:</h2>
        ${plugins.map((plugin, index) => `
          <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
            <h3>${plugin.name} v${plugin.version}</h3>
            <p><strong>Description:</strong> ${plugin.description}</p>
            <button onclick="executePlugin(${index})" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
              Execute Plugin
            </button>
            <div id="result-${index}" style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; display: none;">
            </div>
          </div>
        `).join('')}
      </div>
      
      <div style="margin-top: 30px;">
        <h2>Plugin Management</h2>
        <p>
          <a href="http://localhost:3001" target="_blank" style="color: #007bff; text-decoration: none;">
            Open Plugin Management UI →
          </a>
        </p>
      </div>
    </div>
  `;

  // Make plugins available globally for button clicks
  (window as any).plugins = plugins;
  (window as any).executePlugin = (index: number) => {
    const plugin = plugins[index];
    const result = plugin.execute({
      message: "Executed from UI",
      timestamp: new Date().toISOString(),
      userTriggered: true
    });
    
    const resultDiv = document.getElementById(`result-${index}`);
    if (resultDiv) {
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
    }
  };
}

function displayError(error: any) {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <h1>Plugin Host Demo</h1>
      <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 5px; border: 1px solid #f5c6cb;">
        <h2>Error Loading Plugins</h2>
        <p><strong>Error:</strong> ${error.message || error}</p>
        <p>Make sure the plugin service is running on port 3001</p>
      </div>
      
      <div style="margin-top: 30px;">
        <h2>Troubleshooting</h2>
        <ol>
          <li>Start the plugin service: <code>cd packages/plugin-service && npm run dev</code></li>
          <li>Add some plugins via the management UI: <a href="http://localhost:3001" target="_blank">http://localhost:3001</a></li>
          <li>Refresh this page</li>
        </ol>
      </div>
    </div>
  `;
}

// Start the application
main();
