/**
 * Example: Using the Database class programmatically
 */

import { Database } from '../src/index';

async function main() {
  // Create a database instance with custom data path
  const db = new Database('./programmatic-data', 'http://localhost:3001');

  console.log('=== Plugin Service Programmatic Usage Example ===\n');

  // Add a URL-based module
  console.log('1. Adding a URL-based module...');
  const urlModule = db.addModule(
    'remote-plugin',
    'https://example.com/remoteEntry.json'
  );
  console.log('Added:', urlModule);

  // Add a local module (assuming you have a local build)
  console.log('\n2. Adding a local module...');
  try {
    const localModule = db.addModule(
      'local-plugin',
      undefined,
      './path/to/local/plugin'
    );
    console.log('Added:', localModule);
  } catch (error) {
    console.log('Note: Local module path does not exist (this is expected in the example)');
  }

  // Get all modules
  console.log('\n3. Getting all modules...');
  const allModules = db.getAllModules();
  console.log('Total modules:', allModules.length);
  allModules.forEach(mod => {
    console.log(`  - ${mod.name} (${mod.type})`);
  });

  // Generate manifest
  console.log('\n4. Generating manifest...');
  const manifest = db.generateManifest();
  console.log('Manifest:', JSON.stringify(manifest, null, 2));

  // Get a specific module
  console.log('\n5. Getting a specific module...');
  const module = db.getModuleByName('remote-plugin');
  if (module) {
    console.log('Found module:', module.name);
    console.log('  Type:', module.type);
    console.log('  URL:', module.url);
    console.log('  Created:', module.createdAt);
  }

  // Update a module
  console.log('\n6. Updating a module...');
  const updatedModule = db.updateModule(
    'remote-plugin',
    'https://example.com/v2/remoteEntry.json'
  );
  console.log('Updated:', updatedModule.name);
  console.log('  New URL:', updatedModule.url);

  // Remove a module
  console.log('\n7. Removing a module...');
  const removed = db.removeModule('remote-plugin');
  console.log('Removed:', removed);

  // Final state
  console.log('\n8. Final module count:', db.getAllModules().length);

  console.log('\n=== Example Complete ===');
}

main().catch(console.error);

