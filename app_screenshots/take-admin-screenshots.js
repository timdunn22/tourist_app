const puppeteer = require('puppeteer');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const SCREENSHOT_DIR = __dirname;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function clickButtonWithText(page, text) {
  const buttons = await page.$$('button');
  for (const button of buttons) {
    const buttonText = await page.evaluate(el => el.textContent, button);
    if (buttonText && buttonText.toLowerCase().includes(text.toLowerCase())) {
      await button.click();
      return true;
    }
  }
  return false;
}

async function takeScreenshots() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 }); // Desktop view for admin

  try {
    // Go to admin panel
    console.log('Loading admin panel...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(2000);

    // Capture login page
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-01-login.png'), fullPage: false });
    console.log('  Saved: admin-01-login.png');

    // Login with admin credentials
    console.log('\nLogging in as admin...');
    try {
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });

      // Clear any pre-filled values and type credentials
      const emailInput = await page.$('input[type="email"]');
      const passwordInput = await page.$('input[type="password"]');

      await emailInput.click({ clickCount: 3 }); // Select all
      await emailInput.type('admin@locallink.app');

      await passwordInput.click({ clickCount: 3 }); // Select all
      await passwordInput.type('LocalLink2024!');

      // Click sign in button
      await clickButtonWithText(page, 'Sign In');
      await delay(3000);
      console.log('Login successful!');
    } catch (e) {
      console.log('Login form error:', e.message);
    }

    // Capture Dashboard
    console.log('\nCapturing admin pages...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-02-dashboard.png'), fullPage: false });
    console.log('  Saved: admin-02-dashboard.png');

    // Navigate through sidebar by clicking links
    const adminPages = [
      { name: 'admin-03-users', label: 'Users' },
      { name: 'admin-04-guides', label: 'Guides' },
      { name: 'admin-05-experiences', label: 'Experiences' },
      { name: 'admin-06-bookings', label: 'Bookings' },
      { name: 'admin-07-reviews', label: 'Reviews' },
      { name: 'admin-08-categories', label: 'Categories' },
      { name: 'admin-09-services', label: 'Services' },
      { name: 'admin-10-stays', label: 'Stays' },
      { name: 'admin-11-training', label: 'Training' },
      { name: 'admin-12-locations', label: 'Locations' },
      { name: 'admin-13-settings', label: 'Settings' },
      { name: 'admin-14-support', label: 'Support' },
      { name: 'admin-15-reports', label: 'Reports' },
    ];

    for (const pageInfo of adminPages) {
      console.log(`Capturing: ${pageInfo.label}...`);
      try {
        // Click the sidebar link
        const clicked = await page.evaluate((label) => {
          const links = document.querySelectorAll('aside a, aside button, nav a');
          for (const link of links) {
            if (link.textContent && link.textContent.includes(label)) {
              link.click();
              return true;
            }
          }
          return false;
        }, pageInfo.label);

        if (clicked) {
          await delay(1500);
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `${pageInfo.name}.png`),
            fullPage: false,
          });
          console.log(`  Saved: ${pageInfo.name}.png`);
        } else {
          console.log(`  Could not find link for ${pageInfo.label}`);
        }
      } catch (err) {
        console.log(`  Error capturing ${pageInfo.name}: ${err.message}`);
      }
    }

  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
    console.log('\nDone! Admin screenshots saved to:', SCREENSHOT_DIR);
  }
}

takeScreenshots();
