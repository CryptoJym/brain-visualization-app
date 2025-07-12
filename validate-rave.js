// Quick validation script to test RAVE implementation
const puppeteer = require('puppeteer');

(async () => {
  console.log('🧪 Testing RAVE Three-Brain implementation...\n');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture console messages
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  // Capture page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });
  
  try {
    console.log('📍 Navigating to http://localhost:5175/?view=default');
    await page.goto('http://localhost:5175/?view=default', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // Wait a bit for the RAVE library to initialize
    await page.waitForTimeout(3000);
    
    // Check if RAVE library loaded
    const raveLoaded = await page.evaluate(() => {
      return typeof window.threeBrain !== 'undefined';
    });
    
    // Check if viewer initialized
    const viewerInfo = await page.evaluate(() => {
      const container = document.querySelector('[ref="containerRef"]');
      const canvas = document.querySelector('canvas');
      return {
        hasContainer: !!container,
        hasCanvas: !!canvas,
        canvasSize: canvas ? { width: canvas.width, height: canvas.height } : null
      };
    });
    
    // Check for error messages
    const errorMessage = await page.evaluate(() => {
      const errorEl = document.querySelector('.bg-red-900\\/50');
      return errorEl ? errorEl.textContent : null;
    });
    
    console.log('\n📊 Test Results:');
    console.log('================');
    console.log(`✓ RAVE Library Loaded: ${raveLoaded ? '✅ Yes' : '❌ No'}`);
    console.log(`✓ Canvas Present: ${viewerInfo.hasCanvas ? '✅ Yes' : '❌ No'}`);
    if (viewerInfo.canvasSize) {
      console.log(`  - Canvas Size: ${viewerInfo.canvasSize.width}x${viewerInfo.canvasSize.height}`);
    }
    console.log(`✓ Error Messages: ${errorMessage ? '❌ ' + errorMessage : '✅ None'}`);
    
    if (pageErrors.length > 0) {
      console.log('\n❌ Page Errors:');
      pageErrors.forEach(err => console.log(`   - ${err}`));
    }
    
    // Filter out noise from console logs
    const relevantLogs = consoleLogs.filter(log => 
      !log.text.includes('Download the React DevTools') &&
      !log.text.includes('[HMR]') &&
      !log.text.includes('Consider adding an error boundary')
    );
    
    if (relevantLogs.length > 0) {
      console.log('\n📝 Console Output:');
      relevantLogs.forEach(log => {
        const icon = log.type === 'error' ? '❌' : log.type === 'warning' ? '⚠️' : '📍';
        console.log(`   ${icon} [${log.type}] ${log.text}`);
      });
    }
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'rave-implementation-test.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved as: rave-implementation-test.png');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Test complete!');
  }
})();