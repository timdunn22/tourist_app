const puppeteer = require('puppeteer');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = __dirname;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 }); // Desktop viewport

  try {
    // 1. Home Page
    console.log('Capturing Home page...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-01-home.png'), fullPage: false });
    console.log('  Saved: webapp-01-home.png');

    // Full page home
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-02-home-full.png'), fullPage: true });
    console.log('  Saved: webapp-02-home-full.png');

    // 2. Explore Page
    console.log('Capturing Explore page...');
    await page.goto(`${BASE_URL}/explore`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(2000); // Wait for map to load
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-03-explore.png'), fullPage: false });
    console.log('  Saved: webapp-03-explore.png');

    // Try to switch to map view if there's a toggle
    const mapToggleClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const mapBtn = buttons.find(b => b.textContent.toLowerCase().includes('map'));
      if (mapBtn) {
        mapBtn.click();
        return true;
      }
      return false;
    });
    if (mapToggleClicked) {
      await delay(2000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-04-explore-map.png'), fullPage: false });
      console.log('  Saved: webapp-04-explore-map.png');
    }

    // 3. Experience Detail Page
    console.log('Capturing Experience Detail page...');
    await page.goto(`${BASE_URL}/experience/1`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-05-experience-detail.png'), fullPage: false });
    console.log('  Saved: webapp-05-experience-detail.png');

    // Full page detail
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-06-experience-detail-full.png'), fullPage: true });
    console.log('  Saved: webapp-06-experience-detail-full.png');

    // 4. Guide Profile Page
    console.log('Capturing Guide Profile page...');
    await page.goto(`${BASE_URL}/guide/1`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-07-guide-profile.png'), fullPage: false });
    console.log('  Saved: webapp-07-guide-profile.png');

    // 5. Login Page
    console.log('Capturing Login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-08-login.png'), fullPage: false });
    console.log('  Saved: webapp-08-login.png');

    // 6. Register Page
    console.log('Capturing Register page...');
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-09-register.png'), fullPage: false });
    console.log('  Saved: webapp-09-register.png');

    // 7. Log in to access protected pages
    console.log('\nLogging in to access protected pages...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(500);

    // Click "Demo Login" or sign in button
    const demoButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.toLowerCase().includes('demo'));
    });

    if (demoButton) {
      await demoButton.click();
      await delay(1500);
      console.log('  Logged in with demo account');
    } else {
      // Try regular sign in
      const signInButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.find(b => b.textContent.toLowerCase().includes('sign in'));
      });
      if (signInButton) {
        await signInButton.click();
        await delay(1500);
      }
    }

    // 8. Bookings Page (protected)
    console.log('Capturing Bookings page...');
    await page.goto(`${BASE_URL}/bookings`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-10-bookings.png'), fullPage: false });
    console.log('  Saved: webapp-10-bookings.png');

    // 9. Messages Page (protected)
    console.log('Capturing Messages page...');
    await page.goto(`${BASE_URL}/messages`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-11-messages.png'), fullPage: false });
    console.log('  Saved: webapp-11-messages.png');

    // 10. Favorites Page (protected)
    console.log('Capturing Favorites page...');
    await page.goto(`${BASE_URL}/favorites`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-12-favorites.png'), fullPage: false });
    console.log('  Saved: webapp-12-favorites.png');

    // 11. Profile Page (protected)
    console.log('Capturing Profile page...');
    await page.goto(`${BASE_URL}/profile`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-13-profile.png'), fullPage: false });
    console.log('  Saved: webapp-13-profile.png');

    // Full page profile
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'webapp-14-profile-full.png'), fullPage: true });
    console.log('  Saved: webapp-14-profile-full.png');

  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
    console.log('\nDone! Screenshots saved to:', SCREENSHOT_DIR);
  }
}

takeScreenshots();
