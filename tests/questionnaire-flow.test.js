const puppeteer = require('puppeteer');

const waitForButton = async (page, label) => {
  await page.waitForFunction(
    (text) => Array.from(document.querySelectorAll('button')).some(
      (btn) => btn.textContent && btn.textContent.toLowerCase().includes(text.toLowerCase())
    ),
    { timeout: 20000 },
    label
  );
};

const clickButton = async (page, label) => {
  const clicked = await page.evaluate((text) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const target = buttons.find(
      (btn) => btn.textContent && btn.textContent.toLowerCase().includes(text.toLowerCase())
    );
    if (target) {
      target.click();
      return true;
    }
    return false;
  }, label);

  if (!clicked) {
    throw new Error(`Unable to locate button with label "${label}"`);
  }
};

(async () => {
  const baseUrl = process.env.APP_URL || 'http://localhost:4174/';
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1360, height: 768 } });
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${baseUrl}`);
    await page.goto(baseUrl, { waitUntil: 'networkidle0' });
    await page.waitForTimeout(1500);

    const initialButtons = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).map((btn) => btn.textContent?.trim())
    );
    console.log('Initial buttons:', initialButtons);

    await waitForButton(page, 'Female');
    await clickButton(page, 'Female');
    await page.waitForTimeout(250);

    for (let step = 0; step < 60; step += 1) {
      const completed = await page.evaluate(() =>
        Array.from(document.querySelectorAll('h1')).some((h) => h.textContent?.includes('Neurological Impact Assessment'))
      );
      if (completed) {
        break;
      }
      await clickButton(page, 'No');
      await page.waitForTimeout(180);
    }

    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('h1')).some((h) => h.textContent?.includes('Neurological Impact Assessment')),
      { timeout: 20000 }
    );

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const tab = buttons.find((btn) => btn.textContent?.trim().toLowerCase() === 'visualization');
      tab?.click();
    });

    await page.waitForSelector('canvas', { timeout: 15000 });

    const snapshot = await page.evaluate(() => {
      const collectText = (selector) =>
        Array.from(document.querySelectorAll(selector)).map((el) => el.textContent?.trim()).filter(Boolean);

      const activeTab = Array.from(document.querySelectorAll('button'))
        .find((btn) => btn.textContent?.trim().toLowerCase() === 'visualization' && btn.className.includes('border-b-2'))
        ?.textContent?.trim();

      return {
        activeTab,
        hasCanvas: !!document.querySelector('canvas'),
        systemOptions: collectText('select option'),
        headline: Array.from(document.querySelectorAll('h1')).find((h) => h.textContent?.includes('Neurological'))?.textContent?.trim() || null
      };
    });

    console.log('Questionnaire flow snapshot:', JSON.stringify(snapshot, null, 2));
  } catch (error) {
    console.error('Questionnaire flow test failed:', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
