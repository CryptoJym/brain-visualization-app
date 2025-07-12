// Quick script to check if the app is responding
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5175,
  path: '/?view=default',
  method: 'GET'
};

console.log('Checking app at http://localhost:5175/?view=default ...\n');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse length:', data.length, 'bytes');
    
    // Check for key elements
    if (data.includes('<!DOCTYPE html>')) {
      console.log('✓ HTML document received');
    }
    
    if (data.includes('<div id="root">')) {
      console.log('✓ React root element found');
    }
    
    if (data.includes('vite')) {
      console.log('✓ Vite dev server detected');
    }
    
    // Check for errors
    if (data.includes('error') || data.includes('Error')) {
      console.log('⚠️  Possible error found in response');
      const errorMatch = data.match(/[Ee]rror[^<\n]*/);
      if (errorMatch) {
        console.log('   Error text:', errorMatch[0]);
      }
    }
    
    // Save full response for inspection
    require('fs').writeFileSync('app-response.html', data);
    console.log('\nFull response saved to app-response.html');
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();