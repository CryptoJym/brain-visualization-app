const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });
  
  // Capture page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push({
      message: error.message,
      stack: error.stack
    });
  });
  
  // Capture request failures
  const failedRequests = [];
  page.on('requestfailed', request => {
    failedRequests.push({
      url: request.url(),
      failure: request.failure()
    });
  });
  
  try {
    console.log('Navigating to http://localhost:5173/...');
    const response = await page.goto('http://localhost:5173/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('\n=== Page Load Status ===');
    console.log('Status:', response.status());
    console.log('URL:', page.url());
    
    // Wait a bit for any async errors
    await page.waitForTimeout(2000);
    
    // Check if the root element exists
    const rootExists = await page.evaluate(() => {
      return document.getElementById('root') !== null;
    });
    console.log('Root element exists:', rootExists);
    
    // Get the content of the root element
    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML : 'Root not found';
    });
    console.log('Root content length:', rootContent.length);
    
    console.log('\n=== Console Messages ===');
    consoleMessages.forEach((msg, i) => {
      console.log(`${i + 1}. [${msg.type}] ${msg.text}`);
      if (msg.location.url) {
        console.log(`   at ${msg.location.url}:${msg.location.lineNumber}`);
      }
    });
    
    console.log('\n=== Page Errors ===');
    if (pageErrors.length === 0) {
      console.log('No page errors detected');
    } else {
      pageErrors.forEach((error, i) => {
        console.log(`${i + 1}. ${error.message}`);
        if (error.stack) {
          console.log('   Stack:', error.stack);
        }
      });
    }
    
    console.log('\n=== Failed Requests ===');
    if (failedRequests.length === 0) {
      console.log('No failed requests');
    } else {
      failedRequests.forEach((req, i) => {
        console.log(`${i + 1}. ${req.url}`);
        console.log(`   Failure: ${req.failure.errorText}`);
      });
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'console-check-screenshot.png' });
    console.log('\nScreenshot saved as console-check-screenshot.png');
    
  } catch (error) {
    console.error('Error during test:', error);
  }
  
  // Keep browser open for manual inspection
  console.log('\nBrowser will remain open for inspection. Press Ctrl+C to close.');
  // await browser.close();
})();