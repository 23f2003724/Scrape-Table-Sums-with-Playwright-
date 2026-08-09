const { chromium } = require('@playwright/test');

const SEEDS = [66, 67, 68, 69, 70, 71, 72, 73, 74, 75];
const BASE_URL = 'https://sanand0.github.io/tdsdata/js_table/?seed=';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();

  let grandTotal = 0;

  for (const seed of SEEDS) {
    const url = `${BASE_URL}${seed}`;
    const page = await context.newPage();

    console.log(`\nScraping seed ${seed}: ${url}`);

    // Navigate and wait until network is idle so JS-rendered tables are present
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for at least one table to appear in the DOM
    await page.waitForSelector('table', { timeout: 30000 });

    // Extract every text node inside every <td> across all tables
    const seedTotal = await page.evaluate(() => {
      let sum = 0;
      document.querySelectorAll('table td').forEach(cell => {
        const text = cell.innerText.trim();
        // parseFloat returns NaN for non-numeric strings; filter those out
        const num = parseFloat(text);
        if (!isNaN(num)) {
          sum += num;
        }
      });
      return sum;
    });

    console.log(`  Seed ${seed} total: ${seedTotal}`);
    grandTotal += seedTotal;

    await page.close();
  }

  await browser.close();

  console.log(`\n========================================`);
  console.log(`Grand total across all seeds (66–75): ${grandTotal}`);
  console.log(`========================================`);
})();
