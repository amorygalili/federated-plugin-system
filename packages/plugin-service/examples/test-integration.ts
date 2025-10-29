/**
 * Simple test to verify the plugin-service package works correctly
 * Run with: npx tsx examples/test-integration.ts
 */

import express from 'express';
import { createPluginServiceRouter, createPluginServiceApp, Database } from '../src/index';

console.log('=== Plugin Service Integration Test ===\n');

// Test 1: Database class
console.log('Test 1: Database class');
try {
  const db = new Database('./test-data', 'http://localhost:3000');
  console.log('✓ Database instance created');
  
  // Add a module
  db.addModule('test-module', 'http://example.com/remoteEntry.json');
  console.log('✓ Module added');
  
  // Get all modules
  const modules = db.getAllModules();
  console.log(`✓ Retrieved ${modules.length} module(s)`);
  
  // Generate manifest
  const manifest = db.generateManifest();
  console.log('✓ Manifest generated:', manifest);
  
  // Remove module
  db.removeModule('test-module');
  console.log('✓ Module removed');
  
  console.log('✓ Test 1 PASSED\n');
} catch (error) {
  console.error('✗ Test 1 FAILED:', error);
  process.exit(1);
}

// Test 2: createPluginServiceRouter
console.log('Test 2: createPluginServiceRouter');
try {
  const router = createPluginServiceRouter({
    dataPath: './test-router-data',
    baseUrl: 'http://localhost:3000',
    enableCors: true,
    serveUI: true,
    enableHealthCheck: true
  });
  console.log('✓ Router created');
  
  // Verify it's an Express Router
  if (typeof router === 'function' && router.stack) {
    console.log('✓ Router is valid Express Router');
  } else {
    throw new Error('Router is not a valid Express Router');
  }
  
  console.log('✓ Test 2 PASSED\n');
} catch (error) {
  console.error('✗ Test 2 FAILED:', error);
  process.exit(1);
}

// Test 3: createPluginServiceApp
console.log('Test 3: createPluginServiceApp');
try {
  const app = createPluginServiceApp({
    dataPath: './test-app-data',
    baseUrl: 'http://localhost:3001',
    enableCors: true,
    serveUI: true,
    enableHealthCheck: true
  });
  console.log('✓ App created');
  
  // Verify it's an Express app
  if (typeof app === 'function' && app.listen) {
    console.log('✓ App is valid Express application');
  } else {
    throw new Error('App is not a valid Express application');
  }
  
  console.log('✓ Test 3 PASSED\n');
} catch (error) {
  console.error('✗ Test 3 FAILED:', error);
  process.exit(1);
}

// Test 4: Integration with Express
console.log('Test 4: Integration with Express');
try {
  const app = express();
  
  // Add some routes
  app.get('/test', (_req, res) => {
    res.json({ test: 'ok' });
  });
  
  // Mount plugin service
  const pluginRouter = createPluginServiceRouter({
    dataPath: './test-integration-data',
    baseUrl: 'http://localhost:3002'
  });
  
  app.use('/plugins', pluginRouter);
  console.log('✓ Plugin service mounted on Express app');
  
  // Start server briefly to verify it works
  const server = app.listen(3002, () => {
    console.log('✓ Server started successfully');
    server.close(() => {
      console.log('✓ Server stopped');
      console.log('✓ Test 4 PASSED\n');
      
      console.log('=== All Tests PASSED ===');
      console.log('\nThe plugin-service package is working correctly!');
      console.log('You can now use it in your applications.\n');
    });
  });
} catch (error) {
  console.error('✗ Test 4 FAILED:', error);
  process.exit(1);
}

