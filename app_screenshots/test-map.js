const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testMap() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 });

  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    console.log('Loading app...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(3000);

    // Click through onboarding
    console.log('Navigating through onboarding...');
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Next')) {
        await button.click();
        await delay(500);
        break;
      }
    }

    // Click Next again
    const buttons2 = await page.$$('button');
    for (const button of buttons2) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Next')) {
        await button.click();
        await delay(500);
        break;
      }
    }

    // Click Traveler
    const buttons3 = await page.$$('button');
    for (const button of buttons3) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.toLowerCase().includes('traveler')) {
        await button.click();
        await delay(1000);
        break;
      }
    }

    // Click Sign In
    const buttons4 = await page.$$('button');
    for (const button of buttons4) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.toLowerCase().includes('sign in')) {
        await button.click();
        await delay(1500);
        break;
      }
    }

    console.log('Now on home, clicking Explore...');
    await page.screenshot({ path: '/tmp/test-home.png' });

    // Click Explore in bottom nav
    const navButtons = await page.$$('nav button');
    for (const button of navButtons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Explore')) {
        await button.click();
        await delay(4000); // Wait longer for Leaflet to load tiles
        break;
      }
    }

    console.log('Taking map screenshot...');
    await page.screenshot({ path: '/tmp/test-map.png' });

    // Test zoom - zoom out to see more area
    console.log('Testing zoom out...');
    await page.evaluate(() => {
      if (window.L) {
        const maps = document.querySelectorAll('.leaflet-container');
        if (maps.length > 0) {
          // Click zoom out button twice
          const zoomOut = document.querySelector('.leaflet-control-zoom-out');
          if (zoomOut) {
            zoomOut.click();
          }
        }
      }
    });
    await delay(2000);
    await page.screenshot({ path: '/tmp/test-map-zoomed.png' });

    // Check if leaflet container exists
    const hasLeaflet = await page.evaluate(() => {
      const container = document.querySelector('.leaflet-container');
      return container ? 'Leaflet found!' : 'No leaflet container';
    });
    console.log('Leaflet status:', hasLeaflet);

    // Check current view
    const bodyContent = await page.evaluate(() => {
      return document.body.innerHTML.substring(0, 500);
    });
    console.log('Body content preview:', bodyContent.substring(0, 300));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
}

testMap();
