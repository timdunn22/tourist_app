const puppeteer = require('puppeteer');
const path = require('path');

const BASE_URL = 'http://localhost:5173';
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

async function clickElementWithText(page, selector, text) {
  const elements = await page.$$(selector);
  for (const el of elements) {
    const elText = await page.evaluate(e => e.textContent, el);
    if (elText && elText.toLowerCase().includes(text.toLowerCase())) {
      await el.click();
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
  await page.setViewport({ width: 390, height: 844 }); // iPhone 14 Pro dimensions

  try {
    // Start at the app root - wait for splash to complete
    console.log('Loading app...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 30000 });
    await delay(3000); // Wait for splash screen animation

    // Capture screen 1 (after splash)
    console.log('Capturing onboarding screens...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-onboarding-1.png'), fullPage: false });
    console.log('  Saved: 01-onboarding-1.png');

    // Click Next for screen 2
    await clickButtonWithText(page, 'Next');
    await delay(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-onboarding-2.png'), fullPage: false });
    console.log('  Saved: 02-onboarding-2.png');

    // Click Next for screen 3 (user type selection)
    await clickButtonWithText(page, 'Next');
    await delay(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-onboarding-3.png'), fullPage: false });
    console.log('  Saved: 03-onboarding-3.png');

    // Click "I'm a Traveler" to go to auth screen
    console.log('\nSelecting traveler role...');
    await clickButtonWithText(page, 'Traveler');
    await delay(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-auth.png'), fullPage: false });
    console.log('  Saved: 04-auth.png');

    // Click "Sign In" button to log in (the app accepts empty credentials for demo)
    console.log('\nLogging in...');
    if (await clickButtonWithText(page, 'Sign In')) {
      await delay(1500);
      console.log('Login successful!');
    }

    // Now we should be in the main app - capture Home
    console.log('\nCapturing main app screens...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-home.png'), fullPage: false });
    console.log('  Saved: 05-home.png');

    // Full page home
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-home-fullpage.png'), fullPage: true });
    console.log('  Saved: 06-home-fullpage.png');

    // Navigate to Explore/Map (via bottom nav or button)
    console.log('\nCapturing Explore/Map...');
    await clickButtonWithText(page, 'Explore');
    await delay(4000); // Wait for Leaflet map tiles to load
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-explore-map.png'), fullPage: false });
    console.log('  Saved: 07-explore-map.png');

    // Zoom out to show more markers and take another screenshot
    console.log('Zooming out map...');
    await page.evaluate(() => {
      const zoomOut = document.querySelector('.leaflet-control-zoom-out');
      if (zoomOut) zoomOut.click();
    });
    await delay(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07b-map-zoomed-out.png'), fullPage: false });
    console.log('  Saved: 07b-map-zoomed-out.png');

    // Click on first experience to see detail
    console.log('\nCapturing Experience detail...');
    // Look for experience cards and click
    const experienceClicked = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="card"], [class*="exp"]');
      for (const card of cards) {
        if (card.textContent && card.textContent.includes('Temple') || card.textContent.includes('Tour') || card.textContent.includes('Walk')) {
          card.click();
          return true;
        }
      }
      // Try clicking any card-like element
      const anyCard = document.querySelector('[class*="card"]');
      if (anyCard) {
        anyCard.click();
        return true;
      }
      return false;
    });

    if (experienceClicked) {
      await delay(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-experience-detail.png'), fullPage: false });
      console.log('  Saved: 08-experience-detail.png');

      // Full page detail
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-experience-detail-full.png'), fullPage: true });
      console.log('  Saved: 09-experience-detail-full.png');

      // Try to book
      if (await clickButtonWithText(page, 'Book')) {
        await delay(1000);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-booking.png'), fullPage: false });
        console.log('  Saved: 10-booking.png');

        // Go back
        await clickButtonWithText(page, '←');
        await delay(500);
      }

      // Go back to explore/home
      await clickButtonWithText(page, '←');
      await delay(500);
    }

    // Navigate to Services
    console.log('\nCapturing Services...');
    await clickButtonWithText(page, 'Services');
    await delay(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-services.png'), fullPage: false });
    console.log('  Saved: 11-services.png');

    // Navigate to Stays
    console.log('\nCapturing Stays...');
    await clickButtonWithText(page, 'Stays');
    await delay(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-stays.png'), fullPage: false });
    console.log('  Saved: 12-stays.png');

    // Navigate to Profile
    console.log('\nCapturing Profile...');
    await clickButtonWithText(page, 'Profile');
    await delay(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-profile.png'), fullPage: false });
    console.log('  Saved: 13-profile.png');

    // Try to capture Bookings from profile
    console.log('\nCapturing Bookings...');
    await clickButtonWithText(page, 'Booking');
    await delay(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-bookings.png'), fullPage: false });
    console.log('  Saved: 14-bookings.png');

    // Try Messages/Inbox
    console.log('\nCapturing Messages...');
    await clickButtonWithText(page, 'Message');
    await delay(500);
    await clickButtonWithText(page, 'Inbox');
    await delay(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15-messages.png'), fullPage: false });
    console.log('  Saved: 15-messages.png');

  } catch (error) {
    console.error('Error taking screenshots:', error);
  } finally {
    await browser.close();
    console.log('\nDone! Screenshots saved to:', SCREENSHOT_DIR);
  }
}

takeScreenshots();
