#!/usr/bin/env node
/**
 * UX Testing Agent for LocalLink
 *
 * This agent browses the live site, tests user flows, and identifies UX issues.
 * Run with: node scripts/ux-test-agent.js
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  webAppUrl: 'https://webapp-taupe-one-46.vercel.app',
  adminUrl: 'https://admin-flax-five.vercel.app',
  mobilePreviewUrl: 'https://web-kappa-ashy-44.vercel.app',
  adminCredentials: {
    email: 'admin@locallink.app',
    password: 'LocalLink2024!'
  },
  timeout: 30000,
  slowLoadThreshold: 3000, // ms
  outputDir: path.join(__dirname, '../ux-test-results'),
};

// Issue categories
const ISSUE_TYPES = {
  BROKEN_LINK: 'broken_link',
  SLOW_LOAD: 'slow_load',
  CONSOLE_ERROR: 'console_error',
  MISSING_IMAGE: 'missing_image',
  ACCESSIBILITY: 'accessibility',
  LAYOUT: 'layout',
  FUNCTIONALITY: 'functionality',
  MISSING_CONTENT: 'missing_content',
  NETWORK_ERROR: 'network_error',
};

class UXTestAgent {
  constructor() {
    this.browser = null;
    this.issues = [];
    this.pagesVisited = new Set();
    this.consoleErrors = [];
    this.networkErrors = [];
    this.startTime = Date.now();
  }

  async init() {
    console.log('🚀 Starting UX Test Agent...\n');

    // Create output directory
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    console.log('✅ Browser launched\n');
  }

  async createPage() {
    const page = await this.browser.newPage();

    // Set viewport for desktop testing
    await page.setViewport({ width: 1920, height: 1080 });

    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.consoleErrors.push({
          url: page.url(),
          message: msg.text(),
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Capture network errors
    page.on('requestfailed', (request) => {
      this.networkErrors.push({
        url: request.url(),
        failure: request.failure()?.errorText || 'Unknown error',
        resourceType: request.resourceType(),
        pageUrl: page.url(),
        timestamp: new Date().toISOString(),
      });
    });

    // Capture response errors
    page.on('response', (response) => {
      const status = response.status();
      if (status >= 400) {
        this.addIssue({
          type: status === 404 ? ISSUE_TYPES.BROKEN_LINK : ISSUE_TYPES.NETWORK_ERROR,
          severity: status >= 500 ? 'high' : 'medium',
          url: response.url(),
          pageUrl: page.url(),
          description: `HTTP ${status} error for resource`,
          details: { status, statusText: response.statusText() },
        });
      }
    });

    return page;
  }

  addIssue(issue) {
    // Avoid duplicates
    const key = `${issue.type}-${issue.url}-${issue.description}`;
    if (!this.issues.find(i => `${i.type}-${i.url}-${i.description}` === key)) {
      this.issues.push({
        ...issue,
        timestamp: new Date().toISOString(),
      });
      console.log(`⚠️  Issue found: [${issue.type}] ${issue.description}`);
      if (issue.url) console.log(`   URL: ${issue.url}`);
    }
  }

  async measurePageLoad(page, url) {
    const startTime = Date.now();

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: CONFIG.timeout
      });

      const loadTime = Date.now() - startTime;

      if (loadTime > CONFIG.slowLoadThreshold) {
        this.addIssue({
          type: ISSUE_TYPES.SLOW_LOAD,
          severity: loadTime > 5000 ? 'high' : 'medium',
          url,
          description: `Page load time: ${loadTime}ms (threshold: ${CONFIG.slowLoadThreshold}ms)`,
          details: { loadTime },
        });
      }

      return { success: true, loadTime };
    } catch (error) {
      this.addIssue({
        type: ISSUE_TYPES.NETWORK_ERROR,
        severity: 'high',
        url,
        description: `Failed to load page: ${error.message}`,
      });
      return { success: false, error: error.message };
    }
  }

  async checkAccessibility(page, url) {
    try {
      // Check for images without alt text
      const imagesWithoutAlt = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images)
          .filter(img => !img.alt || img.alt.trim() === '')
          .map(img => img.src);
      });

      if (imagesWithoutAlt.length > 0) {
        this.addIssue({
          type: ISSUE_TYPES.ACCESSIBILITY,
          severity: 'medium',
          url,
          description: `${imagesWithoutAlt.length} images missing alt text`,
          details: { images: imagesWithoutAlt.slice(0, 5) },
        });
      }

      // Check for buttons/links without accessible text
      const inaccessibleButtons = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button, a[role="button"]');
        return Array.from(buttons)
          .filter(btn => {
            const text = btn.textContent?.trim() || '';
            const ariaLabel = btn.getAttribute('aria-label') || '';
            const title = btn.getAttribute('title') || '';
            return !text && !ariaLabel && !title;
          })
          .map(btn => btn.outerHTML.substring(0, 100));
      });

      if (inaccessibleButtons.length > 0) {
        this.addIssue({
          type: ISSUE_TYPES.ACCESSIBILITY,
          severity: 'medium',
          url,
          description: `${inaccessibleButtons.length} buttons/links without accessible text`,
          details: { elements: inaccessibleButtons.slice(0, 3) },
        });
      }

      // Check for form inputs without labels
      const unlabeledInputs = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, textarea, select');
        return Array.from(inputs)
          .filter(input => {
            const id = input.id;
            const ariaLabel = input.getAttribute('aria-label');
            const placeholder = input.getAttribute('placeholder');
            const label = id ? document.querySelector(`label[for="${id}"]`) : null;
            return !label && !ariaLabel && !placeholder;
          })
          .map(input => ({ type: input.type, name: input.name }));
      });

      if (unlabeledInputs.length > 0) {
        this.addIssue({
          type: ISSUE_TYPES.ACCESSIBILITY,
          severity: 'low',
          url,
          description: `${unlabeledInputs.length} form inputs without labels`,
          details: { inputs: unlabeledInputs },
        });
      }

      // Check color contrast issues (basic check for very light text)
      const lowContrastElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, label');
        const issues = [];

        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          const color = style.color;
          const bgColor = style.backgroundColor;

          // Simple check for very light gray text
          if (color.includes('rgb')) {
            const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
              const [, r, g, b] = match.map(Number);
              // Very light colors on white backgrounds
              if (r > 200 && g > 200 && b > 200 && bgColor === 'rgba(0, 0, 0, 0)') {
                issues.push(el.textContent?.substring(0, 50));
              }
            }
          }
        });

        return issues.slice(0, 5);
      });

      if (lowContrastElements.length > 0) {
        this.addIssue({
          type: ISSUE_TYPES.ACCESSIBILITY,
          severity: 'low',
          url,
          description: 'Potential low contrast text detected',
          details: { elements: lowContrastElements },
        });
      }

    } catch (error) {
      console.log(`   Could not complete accessibility check: ${error.message}`);
    }
  }

  async checkBrokenImages(page, url) {
    try {
      const brokenImages = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images)
          .filter(img => !img.complete || img.naturalWidth === 0)
          .map(img => img.src);
      });

      if (brokenImages.length > 0) {
        this.addIssue({
          type: ISSUE_TYPES.MISSING_IMAGE,
          severity: 'medium',
          url,
          description: `${brokenImages.length} broken or missing images`,
          details: { images: brokenImages },
        });
      }
    } catch (error) {
      console.log(`   Could not check images: ${error.message}`);
    }
  }

  async checkLayout(page, url) {
    try {
      // Check for horizontal overflow (broken layout)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      if (hasHorizontalScroll) {
        this.addIssue({
          type: ISSUE_TYPES.LAYOUT,
          severity: 'medium',
          url,
          description: 'Page has horizontal scroll (potential layout issue)',
        });
      }

      // Check for overlapping elements (basic check)
      const overlappingElements = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button, a, input[type="submit"]');
        const overlaps = [];

        buttons.forEach((el1, i) => {
          const rect1 = el1.getBoundingClientRect();
          buttons.forEach((el2, j) => {
            if (i >= j) return;
            const rect2 = el2.getBoundingClientRect();

            if (rect1.right > rect2.left &&
                rect1.left < rect2.right &&
                rect1.bottom > rect2.top &&
                rect1.top < rect2.bottom) {
              overlaps.push({
                el1: el1.textContent?.substring(0, 30),
                el2: el2.textContent?.substring(0, 30),
              });
            }
          });
        });

        return overlaps;
      });

      if (overlappingElements.length > 0) {
        this.addIssue({
          type: ISSUE_TYPES.LAYOUT,
          severity: 'high',
          url,
          description: `${overlappingElements.length} potentially overlapping clickable elements`,
          details: { overlaps: overlappingElements },
        });
      }

      // Check for empty containers that should have content
      const emptyContainers = await page.evaluate(() => {
        const containers = document.querySelectorAll('[class*="container"], [class*="content"], [class*="list"], main, section');
        return Array.from(containers)
          .filter(el => {
            const text = el.textContent?.trim() || '';
            const children = el.children.length;
            return text.length === 0 && children === 0 && el.offsetHeight > 50;
          })
          .map(el => el.className)
          .slice(0, 5);
      });

      if (emptyContainers.length > 0) {
        this.addIssue({
          type: ISSUE_TYPES.MISSING_CONTENT,
          severity: 'medium',
          url,
          description: 'Empty content containers detected',
          details: { containers: emptyContainers },
        });
      }

    } catch (error) {
      console.log(`   Could not check layout: ${error.message}`);
    }
  }

  async checkMobileResponsiveness(page, url) {
    try {
      // Test mobile viewport
      await page.setViewport({ width: 375, height: 812 }); // iPhone X
      await page.waitForTimeout(500);

      const mobileIssues = await page.evaluate(() => {
        const issues = [];

        // Check if text is too small
        const textElements = document.querySelectorAll('p, span, a, button, label');
        textElements.forEach(el => {
          const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
          if (fontSize < 12 && el.textContent?.trim()) {
            issues.push(`Small text (${fontSize}px): "${el.textContent?.substring(0, 30)}"`);
          }
        });

        // Check if buttons are too small for touch
        const touchTargets = document.querySelectorAll('button, a, input[type="submit"]');
        touchTargets.forEach(el => {
          const rect = el.getBoundingClientRect();
          if ((rect.width < 44 || rect.height < 44) && rect.width > 0 && rect.height > 0) {
            issues.push(`Small touch target (${Math.round(rect.width)}x${Math.round(rect.height)}): "${el.textContent?.substring(0, 20)}"`);
          }
        });

        return issues.slice(0, 10);
      });

      if (mobileIssues.length > 0) {
        this.addIssue({
          type: ISSUE_TYPES.LAYOUT,
          severity: 'medium',
          url,
          description: 'Mobile responsiveness issues detected',
          details: { issues: mobileIssues },
        });
      }

      // Reset viewport
      await page.setViewport({ width: 1920, height: 1080 });

    } catch (error) {
      console.log(`   Could not check mobile responsiveness: ${error.message}`);
    }
  }

  async testPage(page, url, description) {
    console.log(`\n📄 Testing: ${description}`);
    console.log(`   URL: ${url}`);

    if (this.pagesVisited.has(url)) {
      console.log('   Skipping (already visited)');
      return;
    }
    this.pagesVisited.add(url);

    // Load page and measure time
    const loadResult = await this.measurePageLoad(page, url);
    if (!loadResult.success) {
      console.log(`   ❌ Failed to load page`);
      return;
    }
    console.log(`   Load time: ${loadResult.loadTime}ms`);

    // Take screenshot
    const screenshotName = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 100);
    await page.screenshot({
      path: path.join(CONFIG.outputDir, `${screenshotName}.png`),
      fullPage: true,
    });

    // Run all checks
    await this.checkAccessibility(page, url);
    await this.checkBrokenImages(page, url);
    await this.checkLayout(page, url);
    await this.checkMobileResponsiveness(page, url);
  }

  async testWebApp() {
    console.log('\n' + '='.repeat(60));
    console.log('🌐 TESTING WEB APPLICATION');
    console.log('='.repeat(60));

    const page = await this.createPage();

    try {
      // Test homepage
      await this.testPage(page, CONFIG.webAppUrl, 'Homepage');

      // Check for main navigation links and test them
      const navLinks = await page.evaluate(() => {
        const links = document.querySelectorAll('nav a, header a');
        return Array.from(links)
          .map(a => ({ href: a.href, text: a.textContent?.trim() }))
          .filter(l => l.href && l.href.startsWith('http'));
      });

      console.log(`\n   Found ${navLinks.length} navigation links`);

      // Test key pages
      const keyPages = [
        { url: `${CONFIG.webAppUrl}/explore`, desc: 'Explore Page' },
        { url: `${CONFIG.webAppUrl}/login`, desc: 'Login Page' },
        { url: `${CONFIG.webAppUrl}/signup`, desc: 'Signup Page' },
        { url: `${CONFIG.webAppUrl}/experiences`, desc: 'Experiences Page' },
        { url: `${CONFIG.webAppUrl}/guides`, desc: 'Guides Page' },
        { url: `${CONFIG.mobilePreviewUrl}`, desc: 'Mobile Preview Homepage' },
        { url: `${CONFIG.mobilePreviewUrl}/login`, desc: 'Mobile Login Page' },
      ];

      for (const { url, desc } of keyPages) {
        await this.testPage(page, url, desc);
      }

      // Test login flow
      console.log('\n📝 Testing Login Flow...');
      await page.goto(`${CONFIG.webAppUrl}/login`, { waitUntil: 'networkidle2' });

      // Check if login form exists
      const loginFormExists = await page.evaluate(() => {
        const emailInput = document.querySelector('input[type="email"], input[name="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
        return { emailInput: !!emailInput, passwordInput: !!passwordInput, submitButton: !!submitButton };
      });

      if (!loginFormExists.emailInput || !loginFormExists.passwordInput) {
        this.addIssue({
          type: ISSUE_TYPES.FUNCTIONALITY,
          severity: 'high',
          url: `${CONFIG.webAppUrl}/login`,
          description: 'Login form missing required fields',
          details: loginFormExists,
        });
      } else {
        console.log('   ✅ Login form has all required fields');
      }

      // Check signup form
      console.log('\n📝 Testing Signup Flow...');
      await page.goto(`${CONFIG.webAppUrl}/signup`, { waitUntil: 'networkidle2' });

      const signupFormExists = await page.evaluate(() => {
        const nameInput = document.querySelector('input[name="name"], input[name="firstName"]');
        const emailInput = document.querySelector('input[type="email"], input[name="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        return { nameInput: !!nameInput, emailInput: !!emailInput, passwordInput: !!passwordInput };
      });

      if (!signupFormExists.emailInput || !signupFormExists.passwordInput) {
        this.addIssue({
          type: ISSUE_TYPES.FUNCTIONALITY,
          severity: 'high',
          url: `${CONFIG.webAppUrl}/signup`,
          description: 'Signup form missing required fields',
          details: signupFormExists,
        });
      } else {
        console.log('   ✅ Signup form has required fields');
      }

    } catch (error) {
      console.error(`\n❌ Error testing web app: ${error.message}`);
      this.addIssue({
        type: ISSUE_TYPES.FUNCTIONALITY,
        severity: 'high',
        url: CONFIG.webAppUrl,
        description: `Web app testing failed: ${error.message}`,
      });
    } finally {
      await page.close();
    }
  }

  async testAdminPanel() {
    console.log('\n' + '='.repeat(60));
    console.log('👤 TESTING ADMIN PANEL');
    console.log('='.repeat(60));

    const page = await this.createPage();

    try {
      // Test admin login page
      await this.testPage(page, CONFIG.adminUrl, 'Admin Login Page');

      // Check if login form exists
      const loginFormExists = await page.evaluate(() => {
        const emailInput = document.querySelector('input[type="email"], input[name="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        const submitButton = document.querySelector('button[type="submit"]');
        return { emailInput: !!emailInput, passwordInput: !!passwordInput, submitButton: !!submitButton };
      });

      if (!loginFormExists.emailInput || !loginFormExists.passwordInput) {
        this.addIssue({
          type: ISSUE_TYPES.FUNCTIONALITY,
          severity: 'high',
          url: CONFIG.adminUrl,
          description: 'Admin login form missing required fields',
          details: loginFormExists,
        });
        return;
      }

      console.log('\n🔐 Attempting admin login...');

      // Try to login
      await page.type('input[type="email"], input[name="email"]', CONFIG.adminCredentials.email);
      await page.type('input[type="password"]', CONFIG.adminCredentials.password);
      await page.click('button[type="submit"]');

      // Wait for navigation or error
      await page.waitForTimeout(3000);

      const currentUrl = page.url();
      const isLoggedIn = !currentUrl.includes('login');

      if (isLoggedIn) {
        console.log('   ✅ Successfully logged into admin panel');

        // Test admin dashboard
        await this.testPage(page, currentUrl, 'Admin Dashboard');

        // Test key admin pages
        const adminPages = [
          { url: `${CONFIG.adminUrl}/users`, desc: 'Users Management' },
          { url: `${CONFIG.adminUrl}/guides`, desc: 'Guides Management' },
          { url: `${CONFIG.adminUrl}/experiences`, desc: 'Experiences Management' },
          { url: `${CONFIG.adminUrl}/bookings`, desc: 'Bookings' },
          { url: `${CONFIG.adminUrl}/reviews`, desc: 'Reviews' },
          { url: `${CONFIG.adminUrl}/settings`, desc: 'Settings' },
        ];

        for (const { url, desc } of adminPages) {
          await this.testPage(page, url, desc);
        }

      } else {
        console.log('   ⚠️  Could not login - checking for error message');

        const errorMessage = await page.evaluate(() => {
          const error = document.querySelector('[class*="error"], [class*="alert"], [role="alert"]');
          return error?.textContent?.trim();
        });

        this.addIssue({
          type: ISSUE_TYPES.FUNCTIONALITY,
          severity: 'medium',
          url: CONFIG.adminUrl,
          description: `Admin login failed: ${errorMessage || 'Unknown reason'}`,
        });
      }

    } catch (error) {
      console.error(`\n❌ Error testing admin panel: ${error.message}`);
      this.addIssue({
        type: ISSUE_TYPES.FUNCTIONALITY,
        severity: 'high',
        url: CONFIG.adminUrl,
        description: `Admin panel testing failed: ${error.message}`,
      });
    } finally {
      await page.close();
    }
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 GENERATING REPORT');
    console.log('='.repeat(60));

    // Add console errors as issues
    this.consoleErrors.forEach(error => {
      this.addIssue({
        type: ISSUE_TYPES.CONSOLE_ERROR,
        severity: 'low',
        url: error.url,
        description: error.message.substring(0, 200),
      });
    });

    // Categorize issues by severity
    const highSeverity = this.issues.filter(i => i.severity === 'high');
    const mediumSeverity = this.issues.filter(i => i.severity === 'medium');
    const lowSeverity = this.issues.filter(i => i.severity === 'low');

    const report = {
      summary: {
        totalIssues: this.issues.length,
        highSeverity: highSeverity.length,
        mediumSeverity: mediumSeverity.length,
        lowSeverity: lowSeverity.length,
        pagesVisited: this.pagesVisited.size,
        consoleErrors: this.consoleErrors.length,
        networkErrors: this.networkErrors.length,
        testDuration: `${Math.round((Date.now() - this.startTime) / 1000)}s`,
        timestamp: new Date().toISOString(),
      },
      issues: {
        high: highSeverity,
        medium: mediumSeverity,
        low: lowSeverity,
      },
      consoleErrors: this.consoleErrors.slice(0, 20),
      networkErrors: this.networkErrors.slice(0, 20),
      pagesVisited: Array.from(this.pagesVisited),
    };

    // Write JSON report
    const reportPath = path.join(CONFIG.outputDir, 'ux-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Write human-readable report
    const readableReport = this.generateReadableReport(report);
    const readableReportPath = path.join(CONFIG.outputDir, 'ux-test-report.md');
    fs.writeFileSync(readableReportPath, readableReport);

    console.log(`\n📁 Reports saved to: ${CONFIG.outputDir}`);
    console.log(`   - ux-test-report.json`);
    console.log(`   - ux-test-report.md`);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 SUMMARY');
    console.log('='.repeat(60));
    console.log(`   Pages tested: ${report.summary.pagesVisited}`);
    console.log(`   Total issues: ${report.summary.totalIssues}`);
    console.log(`   🔴 High severity: ${report.summary.highSeverity}`);
    console.log(`   🟡 Medium severity: ${report.summary.mediumSeverity}`);
    console.log(`   🟢 Low severity: ${report.summary.lowSeverity}`);
    console.log(`   Test duration: ${report.summary.testDuration}`);

    return report;
  }

  generateReadableReport(report) {
    let md = `# UX Test Report - LocalLink\n\n`;
    md += `**Generated:** ${report.summary.timestamp}\n`;
    md += `**Test Duration:** ${report.summary.testDuration}\n`;
    md += `**Pages Visited:** ${report.summary.pagesVisited}\n\n`;

    md += `## Summary\n\n`;
    md += `| Severity | Count |\n`;
    md += `|----------|-------|\n`;
    md += `| 🔴 High | ${report.summary.highSeverity} |\n`;
    md += `| 🟡 Medium | ${report.summary.mediumSeverity} |\n`;
    md += `| 🟢 Low | ${report.summary.lowSeverity} |\n`;
    md += `| **Total** | **${report.summary.totalIssues}** |\n\n`;

    if (report.issues.high.length > 0) {
      md += `## 🔴 High Severity Issues\n\n`;
      report.issues.high.forEach((issue, i) => {
        md += `### ${i + 1}. ${issue.description}\n`;
        md += `- **Type:** ${issue.type}\n`;
        md += `- **URL:** ${issue.url}\n`;
        if (issue.details) {
          md += `- **Details:** \`${JSON.stringify(issue.details).substring(0, 200)}\`\n`;
        }
        md += `\n`;
      });
    }

    if (report.issues.medium.length > 0) {
      md += `## 🟡 Medium Severity Issues\n\n`;
      report.issues.medium.forEach((issue, i) => {
        md += `### ${i + 1}. ${issue.description}\n`;
        md += `- **Type:** ${issue.type}\n`;
        md += `- **URL:** ${issue.url}\n`;
        if (issue.details) {
          md += `- **Details:** \`${JSON.stringify(issue.details).substring(0, 200)}\`\n`;
        }
        md += `\n`;
      });
    }

    if (report.issues.low.length > 0) {
      md += `## 🟢 Low Severity Issues\n\n`;
      report.issues.low.forEach((issue, i) => {
        md += `${i + 1}. **${issue.type}:** ${issue.description} (${issue.url})\n`;
      });
      md += `\n`;
    }

    if (report.consoleErrors.length > 0) {
      md += `## Console Errors\n\n`;
      md += `\`\`\`\n`;
      report.consoleErrors.slice(0, 10).forEach(err => {
        md += `[${err.url}] ${err.message.substring(0, 150)}\n`;
      });
      md += `\`\`\`\n\n`;
    }

    md += `## Pages Tested\n\n`;
    report.pagesVisited.forEach(url => {
      md += `- ${url}\n`;
    });

    return md;
  }

  async run() {
    try {
      await this.init();
      await this.testWebApp();
      await this.testAdminPanel();
      const report = await this.generateReport();
      return report;
    } catch (error) {
      console.error(`\n❌ Fatal error: ${error.message}`);
      throw error;
    } finally {
      if (this.browser) {
        await this.browser.close();
        console.log('\n✅ Browser closed');
      }
    }
  }
}

// Run the agent
const agent = new UXTestAgent();
agent.run()
  .then(report => {
    console.log('\n✅ UX Test Agent completed successfully');
    process.exit(report.summary.highSeverity > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error(`\n❌ UX Test Agent failed: ${error.message}`);
    process.exit(1);
  });
