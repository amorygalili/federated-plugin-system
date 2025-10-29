// Simple test script to verify the plugin system is working
// Run this with: node test-plugin-system.js

async function testPluginSystem() {
  const fetch = (await import('node-fetch')).default;
  console.log('🧪 Testing Plugin System...\n');

  try {
    // Test 1: Check if plugin service is running
    console.log('1️⃣ Testing Plugin Service...');
    const serviceResponse = await fetch('http://localhost:3001/api/modules');
    const serviceData = await serviceResponse.json();
    console.log('✅ Plugin Service:', serviceData);

    // Test 2: Check manifest
    console.log('\n2️⃣ Testing Manifest...');
    const manifestResponse = await fetch('http://localhost:3001/api/manifest');
    const manifestData = await manifestResponse.json();
    console.log('✅ Manifest:', manifestData);

    // Test 3: Check plugin system remoteEntry
    console.log('\n3️⃣ Testing Plugin System Remote Entry...');
    const pluginSystemResponse = await fetch('http://localhost:3002/remoteEntry.json');
    const pluginSystemData = await pluginSystemResponse.json();
    console.log('✅ Plugin System Remote Entry:', pluginSystemData);

    // Test 4: Check example plugin remoteEntry
    console.log('\n4️⃣ Testing Example Plugin Remote Entry...');
    const examplePluginResponse = await fetch('http://localhost:3003/remoteEntry.json');
    const examplePluginData = await examplePluginResponse.json();
    console.log('✅ Example Plugin Remote Entry:', examplePluginData);

    console.log('\n🎉 All tests passed! The plugin system should be working correctly.');
    console.log('\n📋 Next steps:');
    console.log('   1. Refresh http://localhost:3004 in your browser');
    console.log('   2. Check the browser console for any errors');
    console.log('   3. You should see the example plugin loaded and executable');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Make sure all services are running:');
    console.log('      - Plugin Service: http://localhost:3001');
    console.log('      - Plugin System: http://localhost:3002');
    console.log('      - Example Plugin: http://localhost:3003');
    console.log('      - Plugin Host: http://localhost:3004');
    console.log('   2. Check the terminal outputs for any errors');
  }
}

testPluginSystem();
